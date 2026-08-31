'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { fetchUserOrders, uploadPaymentProof, cancelUserOrder, Order } from '@/services/order.service';
import { createReview } from '@/services/review.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  CalendarDays, 
  Clock, 
  Upload, 
  XCircle, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

export default function UserOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderForUpload, setSelectedOrderForUpload] = useState<Order | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['userOrders', statusFilter],
    queryFn: () => fetchUserOrders({ status: statusFilter || undefined }),
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ orderId, file }: { orderId: number; file: File }) => uploadPaymentProof(orderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      setSelectedOrderForUpload(null);
      setUploadFile(null);
    },
    onError: (err: any) => setActionError(err.message || 'Gagal mengunggah bukti transfer'),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelUserOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userOrders'] }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: number; rating: number; comment: string }) =>
      createReview({ orderId, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      setSelectedOrderForReview(null);
      setReviewComment('');
    },
    onError: (err: any) => setActionError(err.message || 'Gagal mengirimkan ulasan'),
  });

  const orders = data?.orders || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-24 space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-warm-dark">Riwayat Pesanan Saya</h1>
        <p className="text-xs sm:text-sm text-warm-muted">Pantau status reservasi kamar dan kelola bukti pembayaran.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-warm-border">
        {[
          { label: 'Semua Status', value: '' },
          { label: 'Menunggu Pembayaran', value: 'WAITING_PAYMENT' },
          { label: 'Menunggu Konfirmasi', value: 'WAITING_CONFIRMATION' },
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

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-warm-terracotta mx-auto" /></div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-warm-border text-center space-y-2">
          <CalendarDays className="w-10 h-10 text-warm-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-warm-dark">Belum Ada Pesanan</h3>
          <p className="text-xs text-warm-muted">Anda belum memiliki riwayat reservasi pada kategori status ini.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="double-bezel">
              <div className="double-bezel-inner p-5 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-warm-borderSubtle">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-muted tracking-wider">No. Pesanan</span>
                    <p className="text-xs font-bold text-warm-dark">{order.orderNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold w-fit ${
                    order.status === 'WAITING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'WAITING_CONFIRMATION' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSED' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-warm-muted block">Penginapan & Kamar</span>
                    <b className="text-warm-dark text-sm font-serif">{order.property?.name}</b>
                    <p className="text-warm-muted">{order.room?.name} ({order.guestCount} Tamu)</p>
                  </div>
                  <div>
                    <span className="text-warm-muted block">Jadwal Menginap</span>
                    <b className="text-warm-dark">{formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}</b>
                    <p className="text-warm-muted">{order.totalNights} Malam</p>
                  </div>
                  <div>
                    <span className="text-warm-muted block">Total Biaya</span>
                    <b className="text-warm-terracotta text-sm font-serif">{formatCurrency(order.totalAmount)}</b>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-warm-borderSubtle flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-warm-muted">
                    {order.status === 'WAITING_PAYMENT' && (
                      <span className="flex items-center gap-1 text-amber-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Batas upload bukti: 1 Jam dari pesanan dibuat
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'WAITING_PAYMENT' && (
                      <>
                        <button
                          onClick={() => cancelMutation.mutate(order.id)}
                          className="px-4 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                        <button
                          onClick={() => { setSelectedOrderForUpload(order); setActionError(''); }}
                          className="px-4 py-1.5 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm hover:bg-warm-terracottaHover"
                        >
                          Upload Bukti Transfer
                        </button>
                      </>
                    )}

                    {(order.status === 'PROCESSED' || order.status === 'COMPLETED') && (
                      <button
                        onClick={() => { setSelectedOrderForReview(order); setActionError(''); }}
                        className="px-4 py-1.5 rounded-full bg-warm-sand text-warm-dark text-xs font-bold hover:bg-warm-border flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-warm-terracotta" /> Beri Ulasan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Payment Proof Modal */}
      {selectedOrderForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border">
            <h3 className="font-serif text-lg font-bold text-warm-dark">Upload Bukti Transfer</h3>
            <p className="text-xs text-warm-muted">Pesanan: #{selectedOrderForUpload.orderNumber} (Total: {formatCurrency(selectedOrderForUpload.totalAmount)})</p>

            {actionError && <p className="text-xs text-red-600 p-2 bg-red-50 rounded-xl">{actionError}</p>}

            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-warm-dark file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-warm-sand file:text-xs file:font-semibold cursor-pointer"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedOrderForUpload(null)}
                className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold text-warm-dark"
              >
                Batal
              </button>
              <button
                disabled={!uploadFile || uploadMutation.isPending}
                onClick={() => uploadFile && uploadMutation.mutate({ orderId: selectedOrderForUpload.id, file: uploadFile })}
                className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-xs font-bold text-white shadow-cozy-sm disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Mengunggah...' : 'Kirim Bukti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border">
            <h3 className="font-serif text-lg font-bold text-warm-dark">Beri Ulasan Penginapan</h3>
            <p className="text-xs text-warm-muted">{selectedOrderForReview.property?.name}</p>

            {actionError && <p className="text-xs text-red-600 p-2 bg-red-50 rounded-xl">{actionError}</p>}

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= reviewRating ? 'fill-warm-accent text-warm-accent' : 'text-warm-border'}`} />
                </button>
              ))}
            </div>

            <textarea
              required
              rows={4}
              placeholder="Ceritakan pengalaman menginap Anda..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:ring-1 focus:ring-warm-terracotta"
            />

            <div className="flex gap-2 pt-2">
              <button onClick={() => setSelectedOrderForReview(null)} className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold text-warm-dark">
                Batal
              </button>
              <button
                disabled={!reviewComment || reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ orderId: selectedOrderForReview.id, rating: reviewRating, comment: reviewComment })}
                className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-xs font-bold text-white shadow-cozy-sm disabled:opacity-50"
              >
                {reviewMutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
