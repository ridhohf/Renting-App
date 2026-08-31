'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesReport } from '@/services/report.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Building2, 
  Users, 
  Loader2 
} from 'lucide-react';

export default function TenantReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tenantSalesReport', startDate, endDate],
    queryFn: () =>
      fetchSalesReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const summary = data?.summary || { totalRevenue: 0, totalOrders: 0 };
  const byProperty = data?.byProperty || [];
  const byUser = data?.byUser || [];
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Laporan Analitik & Penjualan</h1>
        <p className="text-xs text-warm-muted">Ringkasan pendapatan dari pesanan yang telah dikonfirmasi dan selesai.</p>
      </div>

      {/* Date Range Filter */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-warm-dark shrink-0">
            <Calendar className="w-4 h-4 text-warm-terracotta" />
            <span>Rentang Tanggal:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-warm-border rounded-xl text-warm-dark flex-1 sm:flex-none"
            />
            <span className="text-xs text-warm-muted">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-warm-border rounded-xl text-warm-dark flex-1 sm:flex-none"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-warm-terracotta font-semibold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-2">
            <div className="flex items-center justify-between text-warm-muted">
              <span className="text-xs font-semibold">Total Pendapatan Bersih</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-2">
            <div className="flex items-center justify-between text-warm-muted">
              <span className="text-xs font-semibold">Total Transaksi Berhasil</span>
              <BarChart3 className="w-4 h-4 text-warm-terracotta" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">
              {summary.totalOrders} Pesanan
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Property */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-5 sm:p-6 space-y-4">
            <h3 className="font-serif text-sm font-bold text-warm-dark flex items-center gap-2">
              <Building2 className="w-4 h-4 text-warm-terracotta" />
              Pendapatan per Properti
            </h3>

            {isLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-warm-terracotta mx-auto" /></div>
            ) : byProperty.length === 0 ? (
              <p className="text-xs text-warm-muted py-4 text-center">Belum ada data penjualan.</p>
            ) : (
              <div className="divide-y divide-warm-borderSubtle">
                {byProperty.map((p) => (
                  <div key={p.propertyId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <b className="text-warm-dark block">{p.propertyName}</b>
                      <span className="text-[10px] text-warm-muted">{p.orderCount} pesanan selesai</span>
                    </div>
                    <span className="font-bold text-warm-terracotta font-serif text-sm">
                      {formatCurrency(p.totalSales)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown by User */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-5 sm:p-6 space-y-4">
            <h3 className="font-serif text-sm font-bold text-warm-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-warm-terracotta" />
              Tamu Paling Sering Menginap
            </h3>

            {isLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-warm-terracotta mx-auto" /></div>
            ) : byUser.length === 0 ? (
              <p className="text-xs text-warm-muted py-4 text-center">Belum ada data tamu.</p>
            ) : (
              <div className="divide-y divide-warm-borderSubtle">
                {byUser.map((u) => (
                  <div key={u.userId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <b className="text-warm-dark block">{u.userName}</b>
                      <span className="text-[10px] text-warm-muted">{u.orderCount} transaksi</span>
                    </div>
                    <span className="font-bold text-warm-dark font-serif text-sm">
                      {formatCurrency(u.totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
