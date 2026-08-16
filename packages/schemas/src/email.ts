import { z } from 'zod';

/**
 * An email draft to be scanned. Recipients are free-text strings on purpose —
 * catching malformed or external recipients is part of what DLP does, so we do
 * NOT force `.email()` here and reject the input before the engine ever sees it.
 */

export const attachmentSchema = z.object({
  filename: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

export const emailDraftSchema = z.object({
  to: z.array(z.string()).default([]),
  subject: z.string().default(''),
  body: z.string().default(''),
  attachments: z.array(attachmentSchema).default([]),
});
export type EmailDraft = z.infer<typeof emailDraftSchema>;
