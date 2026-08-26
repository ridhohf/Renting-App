import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';
import { Role } from '../generated/prisma';

export class RoleGuard {
  static allow(...roles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AppError('Unauthorized', 401));
      }

      if (!roles.includes(req.user.role as Role)) {
        return next(new AppError('Forbidden, insufficient permissions', 403));
      }

      next();
    };
  }
}
