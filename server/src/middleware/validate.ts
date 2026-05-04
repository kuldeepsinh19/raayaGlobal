import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : 'general',
        message: e.msg,
      })),
    });
    return;
  }

  next();
}
