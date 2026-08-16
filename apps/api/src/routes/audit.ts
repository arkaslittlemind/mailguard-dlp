import { Router } from 'express';
import * as repo from '../db/audit.js';

export const auditRouter = Router();

auditRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await repo.listAudit());
  } catch (err) {
    next(err);
  }
});
