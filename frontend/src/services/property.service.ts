import api from '@/lib/api';
import { Property, PropertyCategory, ApiResponse } from '@/types';

export interface PropertyQueryParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  categoryId?: number;
  search?: string;
  sortBy?: 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function fetchPublicProperties(params: PropertyQueryParams): Promise<{
  properties: Property[];
  meta: ApiResponse<Property[]>['meta'];
}> {
  const res = await api.get('/properties', { params });
  return {
    properties: res.data?.data || [],
    meta: res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchPropertyBySlug(slug: string): Promise<Property> {
  const res = await api.get(`/properties/${slug}`);
  return res.data?.data;
}

export async function fetchPublicCategories(): Promise<PropertyCategory[]> {
  // Can get from properties or public categories endpoint
  try {
    const res = await api.get('/categories/public');
    return res.data?.data || [];
  } catch {
    return [];
  }
}
