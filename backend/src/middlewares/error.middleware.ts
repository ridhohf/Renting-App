import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Prisma } from '../generated/prisma';
import { AppError } from '../utils/app.error';

const MULTER_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: 'File size must not exceed 1MB',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field or too many files',
};

function resolveKnownError(err: Error): AppError | null {
  if (err instanceof AppError) return err;
  if (err instanceof MulterError) return new AppError(MULTER_MESSAGES[err.code] || err.message, 400);
  if (err instanceof TokenExpiredError) return new AppError('Token has expired', 400);
  if (err instanceof JsonWebTokenError) return new AppError('Invalid token', 400);
  if (err instanceof Prisma.PrismaClientKnownRequestError) return resolvePrismaError(err);
  return null;
}

function resolvePrismaError(err: Prisma.PrismaClientKnownRequestError): AppError | null {
  if (err.code === 'P2002') return new AppError('Data already exists', 409);
  if (err.code === 'P2003') return new AppError('Data is still referenced by other records', 400);
  if (err.code === 'P2025') return new AppError('Data not found', 404);
  return null;
}

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const known = resolveKnownError(err);
  if (known) {
    res.status(known.statusCode).json({ success: false, message: known.message });
    return;
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
