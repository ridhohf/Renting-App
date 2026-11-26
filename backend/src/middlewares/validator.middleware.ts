import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/app.error';

export class Validator {
  static validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const message = Validator.formatErrors(result.error.errors);
        return next(new AppError(message, 400));
      }
      req[source] = result.data;
      next();
    };
  }

  static validateIdParam(paramName = 'id') {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const value = Number(req.params[paramName]);
      if (!Number.isInteger(value) || value <= 0) {
        return next(new AppError(`Invalid ${paramName} parameter`, 400));
      }
      next();
    };
  }

  private static formatErrors(
    errors: { path: (string | number)[]; message: string }[],
  ): string {
    return errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  }
}
