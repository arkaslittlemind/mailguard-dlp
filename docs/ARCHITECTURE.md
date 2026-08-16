# Architecture & Control Flow

MailGuard DLP is a small full-stack app with a deliberately clean separation of
layers. This document explains **what the pieces are** and **how data flows**
through them.

---

## 1. The big picture

```mermaid
graph TD
  subgraph Browser
    UI["Vue 3 app (apps/web)<br/>Pinia stores · Vue Router · vue-i18n"]
  end

  subgraph Server
    API["Express API (apps/api)"]
  end

  subgraph Data
    DDB[("DynamoDB<br/>policies · audit")]
  end

  subgraph Shared["Shared packages (imported by BOTH sides)"]
    SCH["@mailguard/schemas<br/>Zod schemas + types"]
    ENG["@mailguard/dlp-engine<br/>pure scan engine"]
  end

  UI -->|"REST + JSON<br/>(fetch, Zod-validated)"| API
  API -->|"PutItem / GetItem / Scan / DeleteItem"| DDB

  UI -.imports.-> SCH
  UI -.imports.-> ENG
  API -.imports.-> SCH
  API -.imports.-> ENG
```

**The key idea:** the two shared packages are imported by *both* the browser and
the server.

- **`@mailguard/schemas`** is the single source of truth for every data shape.
  The frontend validates API responses with it; the backend validates request
  bodies with it. Types and runtime validation can never drift apart.
- **`@mailguard/dlp-engine`** is a pure function (`scanEmail`). The browser runs
  it for instant feedback while typing; the server runs the *same code* as the
  authoritative check. "Scan on the client for UX, trust the server for truth."

---

## 2. Layers within each app

| Layer | Frontend (`apps/web`) | Backend (`apps/api`) |
|-------|-----------------------|----------------------|
| Entry | `main.ts` → `App.vue` | `index.ts` → `app.ts` |
| Routing | Vue Router (`router.ts`) | Express routers (`routes/*`) |
| State / logic | Pinia stores (`stores/*`) | route handlers |
| Data access | typed `api` client (`api/client.ts`) | repos (`db/policies.ts`, `db/audit.ts`) |
| Boundary validation | Zod on every response | Zod on every request body |
| External system | the REST API | DynamoDB (`db/client.ts`) |

---

## 3. Control flow — the four journeys

### 3a. App load → list policies

```mermaid
sequenceDiagram
  participant U as Browser (App.vue)
  participant S as Pinia policies store
  participant C as api client
  participant E as Express /policies
  participant D as DynamoDB

  U->>S: onMounted → fetchAll()
  S->>C: api.listPolicies()
  C->>E: GET /policies
  E->>D: Scan(policies table)
  D-->>E: items[]
  E-->>C: 200 JSON
  C->>C: z.array(policySchema).parse()  ← validate at boundary
  C-->>S: Policy[]
  S-->>U: reactive list renders
```

### 3b. Live scan while typing (NO network)

```mermaid
sequenceDiagram
  participant U as ComposeView
  participant S as composer store
  participant E as dlp-engine (in browser)

  U->>S: user types (recipients / subject / body)
  Note over S: draft is a computed from the reactive fields
  S->>E: scanEmail(draft, enabledPolicies)
  E-->>S: ScanResult (violations, blocked)
  S-->>U: live panel updates instantly
```

This is the "derive, don't store" pattern: `liveResult` is a `computed` over the
draft + enabled policies, so it recomputes on every keystroke with zero network
calls. The Send button is disabled while `blocked` is true.

### 3c. Create / update a policy

```mermaid
sequenceDiagram
  participant U as PolicyForm
  participant S as policies store
  participant C as api client
  participant E as Express /policies
  participant D as DynamoDB

  U->>U: build PolicyInput, policyInputSchema.parse()  ← client validation
  U->>S: store.create(input) / update(id, input)
  S->>C: api.createPolicy / updatePolicy
  C->>E: POST /policies  (or PUT /policies/:id)
  E->>E: policyInputSchema.safeParse(body)  ← server validation (422 on fail)
  E->>D: PutItem(full Policy with id + timestamps)
  D-->>E: ok
  E-->>C: 201/200 Policy
  C->>C: policySchema.parse()
  C-->>S: updated list
```

Note the **double validation**: the client checks before sending (fast UX), and
the server checks again because it must never trust the client.

### 3d. Send → authoritative scan + audit (the core flow)

```mermaid
sequenceDiagram
  participant U as ComposeView
  participant S as composer store
  participant E as Express /scan
  participant P as policies repo
  participant EN as dlp-engine (on server)
  participant A as audit repo
  participant D as DynamoDB

  U->>S: click Send → composer.send()
  S->>E: POST /scan { email }
  E->>E: scanRequestSchema.safeParse(body)
  E->>P: listPolicies()
  P->>D: Scan(policies)
  D-->>P: policies[]
  E->>EN: scanEmail(email, policies)   ← authoritative
  EN-->>E: ScanResult
  E->>A: putAudit(record)
  A->>D: PutItem(audit)
  E-->>S: 200 ScanResult
  S-->>U: banner: sent / warned / blocked
```

The audit record is written on **every** send attempt — allowed or blocked —
because a DLP system logs attempts, not just successes.

---

## 4. Local vs. cloud — one switch

The backend talks to DynamoDB Local or real AWS based on a single env var:

```mermaid
graph LR
  API[Express API] -->|DYNAMODB_ENDPOINT set| LOCAL[("DynamoDB Local<br/>docker :8000")]
  API -->|DYNAMODB_ENDPOINT unset| AWS[("AWS DynamoDB<br/>real service")]
```

No code changes between dev and prod — see `apps/api/src/db/client.ts`. The same
principle applies to the frontend: `VITE_API_BASE_URL` points at the local
Express server or the deployed API Gateway URL, and `VITE_ENABLE_MOCKS` swaps the
in-browser MSW mock in or out.

---

## 5. Where validation lives (defense in depth)

```
User input → [client Zod] → HTTP → [server Zod] → engine → DynamoDB
                 ▲                       ▲
         fast UX feedback        never trust the client
```

DynamoDB itself is schemaless (it only enforces the `id` key), so **our schemas
are the schema.** That is exactly why `@mailguard/schemas` is a shared package
rather than duplicated types on each side.
