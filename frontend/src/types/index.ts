export type UserRole = 'USER' | 'TENANT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isVerified: boolean;
  provider: 'EMAIL' | 'GOOGLE';
  createdAt: string;
}

export interface PropertyCategory {
  id: number;
  name: string;
  tenantId: number;
  createdAt: string;
}

export interface PropertyImage {
  id: number;
  propertyId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface RoomImage {
  id: number;
  roomId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface PeakSeasonRate {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE';
  adjustmentValue: number;
  reason?: string | null;
}

export interface Room {
  id: number;
  propertyId: number;
  name: string;
  description: string;
  basePrice: number | string;
  capacity: number;
  totalUnits: number;
  images?: RoomImage[];
  peakSeasonRates?: PeakSeasonRate[];
}

export interface Review {
  id: number;
  orderId: number;
  userId: number;
  propertyId: number;
  rating: number;
  comment: string;
  reply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface Property {
  id: number;
  tenantId: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  lowestPrice?: number;
  avgRating?: number;
  category?: PropertyCategory;
  images?: PropertyImage[];
  rooms?: Room[];
  reviews?: Review[];
  _count?: {
    rooms?: number;
    reviews?: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}
