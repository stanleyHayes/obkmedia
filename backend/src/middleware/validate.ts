import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path.join('.') || 'input';
      res.status(400).json({ error: `${field}: ${first?.message ?? 'invalid value'}` });
      return;
    }
    req.body = result.data;
    next();
  };
}
