import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.coerce.number().positive('Order ID must be positive'),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});

export const replyReviewSchema = z.object({
  reply: z.string().min(2, 'Reply must be at least 2 characters'),
});
