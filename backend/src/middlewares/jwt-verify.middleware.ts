import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app.error';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export class JwtVerify {
  static verifyToken(secret: string) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        const token = JwtVerify.extractToken(req);
        req.user = jwt.verify(token, secret) as JwtPayload;
        next();
      } catch {
        next(new AppError('Unauthorized, invalid or expired token', 401));
      }
    };
  }

  static optionalVerifyToken(secret: string) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        const token = JwtVerify.tryExtractToken(req);
        if (token) req.user = jwt.verify(token, secret) as JwtPayload;
      } catch {
        // Continue unauthenticated if token is invalid or missing
      }
      next();
    };
  }

  private static tryExtractToken(req: Request): string | null {
    const header = req.headers.authorization;
    return header?.startsWith('Bearer ') ? header.split(' ')[1] : null;
  }

  private static extractToken(req: Request): string {
    const token = JwtVerify.tryExtractToken(req);
    if (token) return token;
    throw new AppError('No token provided', 401);
  }
}
