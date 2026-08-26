import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app.error';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class JwtVerify {
  static verifyToken(secret: string) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        const token = JwtVerify.extractToken(req);
        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.user = decoded;
        next();
      } catch {
        next(new AppError('Unauthorized, invalid or expired token', 401));
      }
    };
  }

  private static extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    throw new AppError('No token provided', 401);
  }
}
