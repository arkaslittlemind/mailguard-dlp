import type { NextFunction, Request, Response } from 'express';

/**
 * Central error handler. Express identifies it by its four arguments, so
 * `next` must stay in the signature even though it is unused.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[api] unhandled error:', err);
  res.status(500).json({ error: 'internal_error' });
}
