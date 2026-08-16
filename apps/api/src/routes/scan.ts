import { scanEmail } from '@mailguard/dlp-engine';
import { type AuditRecord, scanRequestSchema } from '@mailguard/schemas';
import { Router } from 'express';
import * as auditRepo from '../db/audit.js';
import * as policiesRepo from '../db/policies.js';

export const scanRouter = Router();

/**
 * The authoritative scan: it re-runs the SAME engine the browser used for live
 * feedback, but against the server's own copy of the policies, and records the
 * outcome in the audit log. The client cannot be trusted to have scanned
 * honestly, so this is the real gate.
 */
scanRouter.post('/', async (req, res, next) => {
  try {
    const parsed = scanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'invalid_request', issues: parsed.error.issues });
      return;
    }
    const policies = await policiesRepo.listPolicies();
    const result = scanEmail(parsed.data.email, policies);

    const record: AuditRecord = {
      ...result,
      id: crypto.randomUUID(),
      subject: parsed.data.email.subject,
      recipientCount: parsed.data.email.to.length,
    };
    await auditRepo.putAudit(record);

    res.json(result);
  } catch (err) {
    next(err);
  }
});
