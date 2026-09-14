import { z } from 'zod';

export const createOrderSchema = z.object({
  propertyId: z.coerce.number().positive('Property ID must be positive'),
  roomId: z.coerce.number().positive('Room ID must be positive'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  guestCount: z.coerce.number().int().min(1, 'Guest count must be at least 1'),
  paymentMethod: z.enum(['MANUAL_TRANSFER', 'PAYMENT_GATEWAY']).optional(),
});
