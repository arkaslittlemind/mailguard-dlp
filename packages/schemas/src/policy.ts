import { z } from 'zod';

/**
 * A DLP policy is `{ metadata } + { one rule definition }`.
 * The rule definition is a discriminated union on `type`, so both the frontend
 * and the backend narrow it exhaustively from the same source of truth.
 */

export const ruleTypeSchema = z.enum(['keyword', 'regex', 'pii', 'recipientDomain', 'attachment']);
export type RuleType = z.infer<typeof ruleTypeSchema>;

export const policyActionSchema = z.enum(['block', 'warn', 'log']);
export type PolicyAction = z.infer<typeof policyActionSchema>;

/** Match a literal word/phrase in subject or body. */
export const keywordRuleSchema = z.object({
  type: z.literal('keyword'),
  term: z.string().min(1),
  caseSensitive: z.boolean().default(false),
});

/** Match a user-supplied regular expression in subject or body. */
export const regexRuleSchema = z.object({
  type: z.literal('regex'),
  pattern: z.string().min(1),
  // Only the safe subset of RegExp flags.
  flags: z
    .string()
    .regex(/^[gimsuy]*$/, 'invalid regex flags')
    .default('g'),
});

export const piiDetectorSchema = z.enum(['credit_card', 'email', 'phone', 'national_id']);
export type PiiDetector = z.infer<typeof piiDetectorSchema>;

/** Detect a category of personally identifiable information. */
export const piiRuleSchema = z.object({
  type: z.literal('pii'),
  detector: piiDetectorSchema,
});

/** Allow or block recipients based on their email domain. */
export const recipientDomainRuleSchema = z.object({
  type: z.literal('recipientDomain'),
  mode: z.enum(['allowlist', 'blocklist']),
  domains: z.array(z.string().min(1)).min(1),
});

/** Block attachments by extension and/or size. */
export const attachmentRuleSchema = z.object({
  type: z.literal('attachment'),
  blockedExtensions: z.array(z.string().min(1)).default([]),
  maxSizeBytes: z.number().int().positive().optional(),
});

export const ruleDefinitionSchema = z.discriminatedUnion('type', [
  keywordRuleSchema,
  regexRuleSchema,
  piiRuleSchema,
  recipientDomainRuleSchema,
  attachmentRuleSchema,
]);
export type RuleDefinition = z.infer<typeof ruleDefinitionSchema>;

/** A fully persisted policy (as returned by the API / stored in DynamoDB). */
export const policySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(280).optional(),
  enabled: z.boolean().default(true),
  action: policyActionSchema,
  definition: ruleDefinitionSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Policy = z.infer<typeof policySchema>;

/** What a client sends to create/update a policy (server owns id + timestamps). */
export const policyInputSchema = policySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type PolicyInput = z.infer<typeof policyInputSchema>;
