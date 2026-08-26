import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
