import api from '@/lib/api';
import { Review } from '@/types';

export async function createReview(data: { orderId: number; rating: number; comment: string }) {
  const res = await api.post('/reviews', data);
  return res.data?.data as Review;
}

export async function fetchPropertyReviews(propertyId: number, params?: { page?: number; limit?: number }) {
  const res = await api.get('/reviews', { params: { propertyId, ...params } });
  return {
    reviews: (res.data?.data || []) as Review[],
    meta: res.data?.meta || { page: 1, limit: 5, total: 0, totalPages: 1 },
  };
}

export async function replyToReview(reviewId: number, reply: string) {
  const res = await api.patch(`/reviews/${reviewId}/reply`, { reply });
  return res.data?.data as Review;
}

export async function fetchUserReviews(params?: { page?: number; limit?: number }) {
  const res = await api.get('/reviews/user', { params });
  return {
    reviews: (res.data?.data || []) as Review[],
    meta: res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}
