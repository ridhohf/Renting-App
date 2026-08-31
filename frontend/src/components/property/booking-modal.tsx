'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { createOrder } from '@/services/order.service';
import { Property, Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  X, 
  Calendar, 
  Users, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

interface BookingModalProps {
  property: Property;
  room: Room;
  initialDates?: { checkIn: string; checkOut: string };
  onClose: () => void;
}

export default function BookingModal({ property, room, initialDates, onClose }: BookingModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [checkInDate, setCheckInDate] = useState(initialDates?.checkIn || '');
  const [checkOutDate, setCheckOutDate] = useState(initialDates?.checkOut || '');
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basePrice = Number(room.basePrice) || 0;

  const calculateEstimates = () => {
    if (!checkInDate || !checkOutDate) return { nights: 1, total: basePrice };
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diffTime = Math.max(0, d2.getTime() - d1.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return { nights, total: basePrice * nights };
  };

  const { nights, total } = calculateEstimates();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setError('Harap lengkapi tanggal check-in dan check-out');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Tanggal check-out harus setelah tanggal check-in');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        propertyId: property.id,
        roomId: room.id,
        checkInDate,
        checkOutDate,
        guestCount,
        paymentMethod: 'MANUAL_TRANSFER',
      });
      router.push('/user/orders');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-cozy-lg border border-warm-border p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center text-warm-dark hover:bg-warm-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2 mb-6">
          <span className="text-[10px] uppercase font-bold text-warm-terracotta tracking-wider">
            Reservasi Kamar
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-warm-dark">
            {room.name}
          </h2>
          <p className="text-xs text-warm-muted truncate">{property.name} — {property.city}</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-warm-dark block mb-1">Check-in</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-warm-dark block mb-1">Check-out</label>
              <input
                type="date"
                required
                min={checkInDate || undefined}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-warm-dark block mb-1">Jumlah Tamu</label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
            >
              {Array.from({ length: room.capacity || 2 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} Orang (Maks. {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-warm-sand/60 rounded-2xl border border-warm-border space-y-2 text-xs">
            <div className="flex justify-between text-warm-muted">
              <span>Tarif dasar per malam</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between text-warm-muted">
              <span>Durasi menginap</span>
              <span>{nights} Malam</span>
            </div>
            <div className="pt-2 border-t border-warm-border flex justify-between font-bold text-sm text-warm-dark">
              <span>Estimasi Total</span>
              <span className="text-warm-terracotta font-serif text-base">{formatCurrency(total)}</span>
            </div>
            <p className="text-[10px] text-warm-muted pt-1">
              *Tarif akhir akan otomatis dihitung memperhitungkan peak season rate yang berlaku.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Memproses Reservasi...' : 'Lanjutkan ke Pembayaran (1 Jam)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
