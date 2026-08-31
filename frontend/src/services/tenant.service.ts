import api from '@/lib/api';
import { Property, PropertyCategory, Room, PeakSeasonRate } from '@/types';

// Categories
export async function fetchTenantCategories(): Promise<PropertyCategory[]> {
  const res = await api.get('/categories');
  return res.data?.data || [];
}

export async function createTenantCategory(name: string): Promise<PropertyCategory> {
  const res = await api.post('/categories', { name });
  return res.data?.data;
}

export async function deleteTenantCategory(id: number) {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
}

// Properties
export async function fetchTenantPropertyList(params?: { page?: number; limit?: number }) {
  const res = await api.get('/properties/tenant/list', { params });
  return {
    properties: (res.data?.data || []) as Property[],
    meta: res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function createTenantProperty(formData: FormData) {
  const res = await api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data as Property;
}

export async function updateTenantProperty(id: number, data: any) {
  const res = await api.put(`/properties/${id}`, data);
  return res.data?.data as Property;
}

export async function deleteTenantProperty(id: number) {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
}

// Rooms
export async function fetchRoomsByProperty(propertyId: number): Promise<Room[]> {
  const res = await api.get(`/rooms?propertyId=${propertyId}`);
  return res.data?.data || [];
}

export async function createTenantRoom(formData: FormData) {
  const res = await api.post('/rooms', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data as Room;
}

export async function updateTenantRoom(id: number, data: any) {
  const res = await api.put(`/rooms/${id}`, data);
  return res.data?.data as Room;
}

export async function deleteTenantRoom(id: number) {
  const res = await api.delete(`/rooms/${id}`);
  return res.data;
}

// Peak Season Rates
export async function fetchPeakSeasonRates(roomId: number): Promise<PeakSeasonRate[]> {
  const res = await api.get(`/peak-seasons?roomId=${roomId}`);
  return res.data?.data || [];
}

export async function createPeakSeasonRate(data: any) {
  const res = await api.post('/peak-seasons', data);
  return res.data?.data;
}

export async function deletePeakSeasonRate(id: number) {
  const res = await api.delete(`/peak-seasons/${id}`);
  return res.data;
}

// Room Unavailability
export async function fetchRoomUnavailabilities(roomId: number) {
  const res = await api.get(`/availability?roomId=${roomId}`);
  return res.data?.data || [];
}

export async function createRoomUnavailability(data: any) {
  const res = await api.post('/availability', data);
  return res.data?.data;
}

export async function deleteRoomUnavailability(id: number) {
  const res = await api.delete(`/availability/${id}`);
  return res.data;
}
