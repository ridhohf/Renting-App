'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchTenantPropertyList } from '@/services/tenant.service';
import { fetchTenantOrders } from '@/services/order.service';
import { fetchSalesReport } from '@/services/report.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Building2, 
  CalendarDays, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  Loader2 
} from 'lucide-react';

export default function TenantDashboardPage() {
  const { data: propData, isLoading: propLoading } = useQuery({
    queryKey: ['tenantPropertiesSummary'],
    queryFn: () => fetchTenantPropertyList({ limit: 5 }),
  });

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['tenantOrdersSummary'],
    queryFn: () => fetchTenantOrders({ limit: 5 }),
  });

  const { data: reportData } = useQuery({
    queryKey: ['tenantSalesReportSummary'],
    queryFn: () => fetchSalesReport(),
  });

  const totalProperties = propData?.meta?.total || 0;
  const recentOrders = orderData?.orders || [];
  const pendingOrders = recentOrders.filter((o) => o.status === 'WAITING_CONFIRMATION').length;
  const totalRevenue = reportData?.summary?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Dashboard Ringkasan Host</h1>
        <p className="text-xs text-warm-muted">Pantau kinerja properti, konfirmasi pesanan masuk, dan total pendapatan.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-2">
            <div className="flex items-center justify-between text-warm-muted">
              <span className="text-xs font-semibold">Total Properti</span>
              <Building2 className="w-4 h-4 text-warm-terracotta" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">{totalProperties}</p>
            <span className="text-[10px] text-warm-muted">Terdaftar aktif</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-2">
            <div className="flex items-center justify-between text-warm-muted">
              <span className="text-xs font-semibold">Menunggu Konfirmasi</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">{pendingOrders}</p>
            <span className="text-[10px] text-warm-muted">Perlu verifikasi pembayaran</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-2">
            <div className="flex items-center justify-between text-warm-muted">
              <span className="text-xs font-semibold">Total Pendapatan</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 truncate">{formatCurrency(totalRevenue)}</p>
            <span className="text-[10px] text-warm-muted">Pesanan selesai</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-warm-dark">Pesanan Terbaru</h3>
            <Link href="/tenant/orders" className="text-xs font-semibold text-warm-terracotta hover:underline flex items-center gap-1">
              <span>Lihat Semua Pesanan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orderLoading ? (
            <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-warm-terracotta mx-auto" /></div>
          ) : recentOrders.length === 0 ? (
            <p className="text-xs text-warm-muted text-center py-6">Belum ada pesanan masuk.</p>
          ) : (
            <div className="divide-y divide-warm-borderSubtle">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-warm-dark">#{o.orderNumber}</span>
                    <p className="text-[11px] text-warm-muted">{o.property?.name} • {o.room?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-warm-dark block">{formatCurrency(o.totalAmount)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.status === 'WAITING_CONFIRMATION' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'PROCESSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-warm-sand text-warm-dark'
                    }`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
