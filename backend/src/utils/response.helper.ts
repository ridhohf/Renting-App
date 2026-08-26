import { Response } from 'express';

interface SuccessPayload {
  message: string;
  data?: unknown;
  meta?: unknown;
}

export function sendSuccess(
  res: Response,
  statusCode: number,
  payload: SuccessPayload,
): void {
  res.status(statusCode).json({
    success: true,
    message: payload.message,
    ...(payload.data !== undefined && { data: payload.data }),
    ...(payload.meta !== undefined && { meta: payload.meta }),
  });
}
