import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { AppError } from '../utils/app.error';

function mapKnownError(err: Error): { status: number; message: string } | null {
  if (err instanceof AppError) return { status: err.statusCode, message: err.message };
  if (err instanceof MulterError) return mapMulterError(err);
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return { status: 400, message: 'Invalid or expired token' };
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return { status: 400, message: 'Invalid JSON payload' };
  }
  return mapPrismaError(err as { code?: string });
}

function mapMulterError(err: MulterError): { status: number; message: string } {
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeds 1MB limit' : err.message;
  return { status: 400, message: msg };
}

function mapPrismaError(err: { code?: string }): { status: number; message: string } | null {
  if (err.code === 'P2002') return { status: 409, message: 'Duplicate record already exists' };
  if (err.code === 'P2025') return { status: 404, message: 'Record not found' };
  if (err.code === 'P2003') return { status: 400, message: 'Invalid or referenced record' };
  return null;
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const mapped = mapKnownError(err);
  if (mapped) {
    res.status(mapped.status).json({ success: false, message: mapped.message });
    return;
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
