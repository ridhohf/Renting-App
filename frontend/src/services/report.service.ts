import api from '@/lib/api';

export interface SalesReportData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
  };
  byProperty: { propertyId: number; propertyName: string; totalSales: number; orderCount: number }[];
  byUser: { userId: number; userName: string; totalSpent: number; orderCount: number }[];
  transactions: any[];
}

export async function fetchSalesReport(params?: {
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<SalesReportData> {
  const res = await api.get('/reports/sales', { params });
  return res.data?.data;
}

export async function fetchPropertyAvailabilityReport(propertyId: number, month: number, year: number) {
  const res = await api.get('/reports/property', {
    params: { propertyId, month, year },
  });
  return res.data?.data;
}
