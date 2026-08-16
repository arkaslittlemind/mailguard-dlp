import { z } from 'zod';
import { emailDraftSchema } from './email.js';
import { policyActionSchema, ruleTypeSchema } from './policy.js';

/** Where in the email a violation was found. */
export const scanFieldSchema = z.enum(['body', 'subject', 'recipients', 'attachments']);
export type ScanField = z.infer<typeof scanFieldSchema>;

export const severitySchema = z.enum(['low', 'medium', 'high']);
export type Severity = z.infer<typeof severitySchema>;

/** A single hit: the text that matched and (for text fields) where. */
export const matchSchema = z.object({
  field: scanFieldSchema,
  snippet: z.string(),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().nonnegative().optional(),
});
export type Match = z.infer<typeof matchSchema>;

/** One policy that fired, with every place it matched. */
export const violationSchema = z.object({
  policyId: z.string(),
  policyName: z.string(),
  ruleType: ruleTypeSchema,
  action: policyActionSchema,
  severity: severitySchema,
  message: z.string(),
  matches: z.array(matchSchema),
});
export type Violation = z.infer<typeof violationSchema>;

/** The outcome of scanning one email against a set of policies. */
export const scanResultSchema = z.object({
  blocked: z.boolean(),
  violations: z.array(violationSchema),
  scannedAt: z.string().datetime(),
});
export type ScanResult = z.infer<typeof scanResultSchema>;

/** Request body for the server-side authoritative scan. */
export const scanRequestSchema = z.object({
  email: emailDraftSchema,
});
export type ScanRequest = z.infer<typeof scanRequestSchema>;

/** A persisted scan, as shown in the audit log. */
export const auditRecordSchema = scanResultSchema.extend({
  id: z.string().uuid(),
  subject: z.string(),
  recipientCount: z.number().int().nonnegative(),
});
export type AuditRecord = z.infer<typeof auditRecordSchema>;
