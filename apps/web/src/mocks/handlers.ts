import { scanEmail } from '@mailguard/dlp-engine';
import {
  type AuditRecord,
  type Policy,
  policyInputSchema,
  scanRequestSchema,
} from '@mailguard/schemas';
import { http, HttpResponse } from 'msw';
import { seedPolicies } from './seed.js';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// In-memory "database" for the mock. Resets on reload — good enough for a demo
// and mirrors exactly what the real DynamoDB-backed API will expose.
let policies: Policy[] = seedPolicies();
let audit: AuditRecord[] = [];

const now = () => new Date().toISOString();

export const handlers = [
  http.get(`${BASE}/policies`, () => HttpResponse.json(policies)),

  http.post(`${BASE}/policies`, async ({ request }) => {
    const parsed = policyInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: 'invalid_policy' }, { status: 422 });
    }
    const created: Policy = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: now(),
      updatedAt: now(),
    };
    policies = [created, ...policies];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${BASE}/policies/:id`, async ({ request, params }) => {
    const parsed = policyInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: 'invalid_policy' }, { status: 422 });
    }
    const existing = policies.find((p) => p.id === params.id);
    if (!existing) {
      return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    }
    const updated: Policy = {
      ...parsed.data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now(),
    };
    policies = policies.map((p) => (p.id === existing.id ? updated : p));
    return HttpResponse.json(updated);
  }),

  http.delete(`${BASE}/policies/:id`, ({ params }) => {
    policies = policies.filter((p) => p.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${BASE}/scan`, async ({ request }) => {
    const parsed = scanRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: 'invalid_request' }, { status: 422 });
    }
    // The authoritative scan runs the SAME engine the client used for live
    // feedback — but against the server's copy of the policies.
    const result = scanEmail(parsed.data.email, policies);
    const record: AuditRecord = {
      ...result,
      id: crypto.randomUUID(),
      subject: parsed.data.email.subject,
      recipientCount: parsed.data.email.to.length,
    };
    audit = [record, ...audit].slice(0, 100);
    return HttpResponse.json(result);
  }),

  http.get(`${BASE}/audit`, () => HttpResponse.json(audit)),
];
