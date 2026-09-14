import { z } from 'zod';

export const createAvailabilitySchema = z.object({
  roomId: z.coerce.number().positive('Room ID must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
});

export const updateAvailabilitySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});
