import { z } from 'zod';

export const createRoomSchema = z.object({
  propertyId: z.coerce.number().positive('Property ID must be positive'),
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  basePrice: z.coerce.number().min(0, 'Base price must be 0 or greater'),
  totalUnits: z.coerce.number().int().min(1, 'Total units must be at least 1'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  totalUnits: z.coerce.number().int().min(1).optional(),
});
