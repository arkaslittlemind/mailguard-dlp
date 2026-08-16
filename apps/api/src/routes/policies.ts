import { type Policy, policyInputSchema } from '@mailguard/schemas';
import { Router } from 'express';
import * as repo from '../db/policies.js';

export const policiesRouter = Router();

policiesRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await repo.listPolicies());
  } catch (err) {
    next(err);
  }
});

policiesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = policyInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'invalid_policy', issues: parsed.error.issues });
      return;
    }
    const now = new Date().toISOString();
    const policy: Policy = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await repo.putPolicy(policy);
    res.status(201).json(policy);
  } catch (err) {
    next(err);
  }
});

policiesRouter.put('/:id', async (req, res, next) => {
  try {
    const parsed = policyInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'invalid_policy', issues: parsed.error.issues });
      return;
    }
    const existing = await repo.getPolicy(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const updated: Policy = {
      ...parsed.data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await repo.putPolicy(updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

policiesRouter.delete('/:id', async (req, res, next) => {
  try {
    await repo.deletePolicy(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
