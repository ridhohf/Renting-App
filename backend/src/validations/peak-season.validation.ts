import { z } from 'zod';

export const createPeakSeasonSchema = z.object({
  roomId: z.coerce.number().positive('Room ID must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  adjustmentType: z.enum(['NOMINAL', 'PERCENTAGE'], {
    required_error: 'Adjustment type must be NOMINAL or PERCENTAGE',
  }),
  adjustmentValue: z.coerce.number().min(0, 'Adjustment value must be positive'),
  reason: z.string().optional(),
});

export const updatePeakSeasonSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  adjustmentType: z.enum(['NOMINAL', 'PERCENTAGE']).optional(),
  adjustmentValue: z.coerce.number().min(0).optional(),
  reason: z.string().optional(),
});
