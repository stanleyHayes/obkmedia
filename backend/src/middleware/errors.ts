import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Mongo duplicate key → friendly, field-aware conflict message
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    const key = Object.keys((err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {})[0];
    const label = key === 'email' ? 'email' : key === 'name' ? 'name' : key ?? 'value';
    res.status(409).json({ error: `That ${label} is already in use` });
    return;
  }
  console.error('[error]', err);
  res.status(500).json({
    error: env.isProduction ? 'Something went wrong' : err instanceof Error ? err.message : 'Unknown error',
  });
}
