import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.coerce.number().positive('Category ID must be a positive number'),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  province: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const updatePropertySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.coerce.number().positive().optional(),
  address: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  province: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});
