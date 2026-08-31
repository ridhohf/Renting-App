import api from '@/lib/api';
import { Property, Room, User } from '@/types';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  propertyId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalNights: number;
  totalAmount: number | string;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';
  paymentProofUrl?: string | null;
  paymentProofUploadedAt?: string | null;
  expiresAt: string;
  cancelledBy?: 'USER' | 'TENANT' | 'SYSTEM' | null;
  cancelReason?: string | null;
  createdAt: string;
  property?: Property;
  room?: Room;
  user?: User;
}

export interface CreateOrderPayload {
  propertyId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  paymentMethod: 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';
}

export async function createOrder(data: CreateOrderPayload): Promise<Order> {
  const res = await api.post('/orders', data);
  return res.data?.data;
}

export async function fetchUserOrders(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const res = await api.get('/orders/user', { params });
  return {
    orders: (res.data?.data || []) as Order[],
    meta: res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchOrderById(id: number): Promise<Order> {
  const res = await api.get(`/orders/user/${id}`);
  return res.data?.data;
}

export async function uploadPaymentProof(orderId: number, file: File) {
  const formData = new FormData();
  formData.append('paymentProof', file);
  const res = await api.patch(`/orders/${orderId}/payment-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data;
}

export async function cancelUserOrder(orderId: number) {
  const res = await api.patch(`/orders/${orderId}/cancel`);
  return res.data?.data;
}

export async function fetchTenantOrders(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const res = await api.get('/orders/tenant', { params });
  return {
    orders: (res.data?.data || []) as Order[],
    meta: res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function confirmTenantPayment(orderId: number) {
  const res = await api.patch(`/orders/${orderId}/confirm`);
  return res.data?.data;
}

export async function rejectTenantPayment(orderId: number) {
  const res = await api.patch(`/orders/${orderId}/reject`);
  return res.data?.data;
}

export async function cancelTenantOrder(orderId: number) {
  const res = await api.patch(`/orders/${orderId}/tenant-cancel`);
  return res.data?.data;
}
