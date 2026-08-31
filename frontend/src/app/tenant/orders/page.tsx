'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTenantOrders, 
  confirmTenantPayment, 
  rejectTenantPayment, 
  cancelTenantOrder, 
  Order 
} from '@/services/order.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2, 
  AlertCircle, 
  X, 
  Clock 
} from 'lucide-react';

export default function TenantOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tenantOrders', statusFilter],
    queryFn: () => fetchTenantOrders({ status: statusFilter || undefined }),
  });

  const confirmMutation = useMutation({
    mutationFn: (orderId: number) => confirmTenantPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantOrders'] });
      setActionError('');
    },
    onError: (err: any) => setActionError(err.message || 'Gagal mengonfirmasi pembayaran'),
  });

  const rejectMutation = useMutation({
    mutationFn: (orderId: number) => rejectTenantPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantOrders'] });
      setActionError('');
    },
    onError: (err: any) => setActionError(err.message || 'Gagal menolak bukti transfer'),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelTenantOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantOrders'] });
      setActionError('');
    },
    onError: (err: any) => setActionError(err.message || 'Gagal membatalkan pesanan'),
  });

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Pesanan & Pembayaran Masuk</h1>
        <p className="text-xs text-warm-muted">Verifikasi bukti transfer tamu, konfirmasi reservasi, dan pantau status pesanan.</p>
      </div>

      {actionError && (
        <div className="p-3.5 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-warm-border">
        {[
          { label: 'Semua', value: '' },
          { label: 'Menunggu Konfirmasi Bukti', value: 'WAITING_CONFIRMATION' },
          { label: 'Menunggu Bayar', value: 'WAITING_PAYMENT' },
          { label: 'Dikonfirmasi', value: 'PROCESSED' },
          { label: 'Selesai', value: 'COMPLETED' },
          { label: 'Dibatalkan', value: 'CANCELLED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
              statusFilter === tab.value
                ? 'bg-warm-terracotta text-white shadow-cozy-sm'
                : 'bg-warm-sand/70 text-warm-dark hover:bg-warm-sand'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Cards List */}
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-warm-terracotta mx-auto" /></div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-warm-border text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-warm-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-warm-dark">Tidak Ada Pesanan</h3>
          <p className="text-xs text-warm-muted">Belum ada pesanan masuk pada kategori status ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="double-bezel">
              <div className="double-bezel-inner p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-warm-borderSubtle">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-muted tracking-wider">No. Pesanan</span>
                    <p className="text-xs font-bold text-warm-dark">#{order.orderNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold w-fit ${
                    order.status === 'WAITING_CONFIRMATION' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'WAITING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'PROCESSED' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-warm-muted block">Tamu Penyewa</span>
                    <b className="text-warm-dark">{order.user?.name}</b>
                    <p className="text-warm-muted">{order.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-warm-muted block">Properti & Kamar</span>
                    <b className="text-warm-dark">{order.property?.name}</b>
                    <p className="text-warm-muted">{order.room?.name} ({order.guestCount} Tamu)</p>
                  </div>
                  <div>
                    <span className="text-warm-muted block">Durasi Sewa</span>
                    <b className="text-warm-dark">{formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}</b>
                    <p className="text-warm-muted">{order.totalNights} Malam</p>
                  </div>
                  <div>
                    <span className="text-warm-muted block">Total Tagihan</span>
                    <b className="text-warm-terracotta font-serif text-base">{formatCurrency(order.totalAmount)}</b>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-warm-borderSubtle flex flex-wrap items-center justify-between gap-3">
                  <div>
                    {order.paymentProofUrl && (
                      <button
                        onClick={() => setSelectedProofUrl(order.paymentProofUrl || null)}
                        className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Bukti Transfer
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'WAITING_CONFIRMATION' && (
                      <>
                        <button
                          onClick={() => { if (confirm('Tolak bukti transfer ini? Status akan kembali ke Menunggu Bayar.')) rejectMutation.mutate(order.id); }}
                          disabled={rejectMutation.isPending}
                          className="px-4 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                        >
                          Tolak Bukti
                        </button>
                        <button
                          onClick={() => { if (confirm('Konfirmasi pembayaran pesanan ini? Email konfirmasi akan otomatis dikirimkan ke user.')) confirmMutation.mutate(order.id); }}
                          disabled={confirmMutation.isPending}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-cozy-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Setujui Pembayaran
                        </button>
                      </>
                    )}

                    {order.status === 'WAITING_PAYMENT' && (
                      <button
                        onClick={() => { if (confirm('Batalkan pesanan ini?')) cancelMutation.mutate(order.id); }}
                        className="px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                      >
                        Batalkan Pesanan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Proof Image Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-cozy-lg border border-warm-border relative">
            <button onClick={() => setSelectedProofUrl(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center"><X className="w-4 h-4" /></button>
            <h3 className="font-serif text-base font-bold text-warm-dark">Bukti Pembayaran Tamu</h3>
            <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-warm-sand">
              <Image src={selectedProofUrl} alt="Payment Proof" fill className="object-contain" />
            </div>
            <button onClick={() => setSelectedProofUrl(null)} className="w-full py-2 rounded-full bg-warm-sand text-xs font-bold text-warm-dark">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
