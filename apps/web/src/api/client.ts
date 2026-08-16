import {
  type AuditRecord,
  type PolicyInput,
  type ScanRequest,
  type ScanResult,
  auditRecordSchema,
  policySchema,
  scanResultSchema,
} from '@mailguard/schemas';
import { z } from 'zod';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Every response is parsed through a Zod schema at the boundary. If the server
 * ever returns a shape we don't expect, we fail loudly here rather than letting
 * bad data leak into the UI — this is the "runtime schema validation" the whole
 * shared-schemas package exists to enable.
 */
async function request<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${path} failed with ${res.status}`);
  }
  return schema.parse(await res.json());
}

export const api = {
  listPolicies: () => request('/policies', z.array(policySchema)),

  createPolicy: (input: PolicyInput) =>
    request('/policies', policySchema, { method: 'POST', body: JSON.stringify(input) }),

  updatePolicy: (id: string, input: PolicyInput) =>
    request(`/policies/${id}`, policySchema, { method: 'PUT', body: JSON.stringify(input) }),

  deletePolicy: (id: string) =>
    request(`/policies/${id}`, z.object({ ok: z.literal(true) }), { method: 'DELETE' }),

  scan: (body: ScanRequest): Promise<ScanResult> =>
    request('/scan', scanResultSchema, { method: 'POST', body: JSON.stringify(body) }),

  listAudit: (): Promise<AuditRecord[]> => request('/audit', z.array(auditRecordSchema)),
};
