import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error.js';
import { auditRouter } from './routes/audit.js';
import { policiesRouter } from './routes/policies.js';
import { scanRouter } from './routes/scan.js';

/**
 * Build the Express app. Kept separate from `listen()` so tests (and, later, a
 * Lambda adapter) can import the configured app without starting a server.
 */
export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/policies', policiesRouter);
  app.use('/scan', scanRouter);
  app.use('/audit', auditRouter);

  app.use(errorHandler);

  return app;
}
