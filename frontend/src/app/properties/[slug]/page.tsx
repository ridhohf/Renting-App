'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyBySlug } from '@/services/property.service';
import { Room } from '@/types';
import RoomCard from '@/components/property/room-card';
import PriceCalendar from '@/components/property/price-calendar';
import ReviewList from '@/components/property/review-list';
import BookingModal from '@/components/property/booking-modal';
import { 
  MapPin, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  Loader2 
} from 'lucide-react';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || '';

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['property', slug],
    queryFn: () => fetchPropertyBySlug(slug),
    enabled: !!slug,
  });

  const [selectedRoomForCalendar, setSelectedRoomForCalendar] = useState<Room | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ checkIn: string; checkOut: string } | undefined>();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-3 text-warm-terracotta">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold text-warm-muted">Memuat detail penginapan...</p>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen pt-32 text-center px-4 max-w-md mx-auto space-y-4">
        <h2 className="font-serif text-2xl font-bold text-warm-dark">Penginapan Tidak Ditemukan</h2>
        <p className="text-xs text-warm-muted">Properti yang Anda cari mungkin sudah tidak tersedia atau link tidak valid.</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 rounded-full bg-warm-terracotta text-white text-xs font-bold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [{ id: 0, imageUrl: DEFAULT_IMAGE, propertyId: property.id, sortOrder: 0 }];
  const rooms = property.rooms || [];
  const activeCalendarRoom = selectedRoomForCalendar || rooms[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-24 space-y-10">
      {/* Back button & Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-warm-muted hover:text-warm-terracotta transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Property Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {property.category && (
            <span className="px-3 py-1 rounded-full bg-warm-sand text-warm-terracotta text-xs font-bold">
              {property.category.name}
            </span>
          )}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warm-dark text-warm-accentLight text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-warm-accent text-warm-accent" />
            <span>{property.avgRating ? Number(property.avgRating).toFixed(1) : 'Baru'}</span>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-warm-dark">
          {property.name}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-warm-muted">
          <MapPin className="w-4 h-4 text-warm-terracotta shrink-0" />
          <span>{property.address}, {property.city}, {property.province}</span>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden shadow-cozy-md">
        <div className="md:col-span-2 relative h-72 sm:h-96 w-full">
          <Image src={images[0].imageUrl} alt={property.name} fill className="object-cover" priority />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-3">
          {images.slice(1, 3).map((img, i) => (
            <div key={img.id || i} className="relative w-full h-full min-h-[140px]">
              <Image src={img.imageUrl} alt={`${property.name} photo ${i + 2}`} fill className="object-cover" />
            </div>
          ))}
          {images.length <= 1 && (
            <>
              <div className="relative w-full h-full min-h-[140px] opacity-80">
                <Image src={images[0].imageUrl} alt={`${property.name} photo detail`} fill className="object-cover" />
              </div>
              <div className="relative w-full h-full min-h-[140px] opacity-60">
                <Image src={images[0].imageUrl} alt={`${property.name} photo ambiance`} fill className="object-cover" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 max-w-3xl">
        <h2 className="font-serif text-xl font-bold text-warm-dark">Tentang Penginapan</h2>
        <p className="text-xs sm:text-sm text-warm-muted leading-relaxed whitespace-pre-line">
          {property.description}
        </p>
      </div>

      {/* Rooms List Section */}
      <div id="pilih-kamar" className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-warm-dark">Pilihan Tipe Kamar</h2>
          <p className="text-xs text-warm-muted">Pilih kamar yang sesuai dengan rencana liburan Anda.</p>
        </div>

        {rooms.length === 0 ? (
          <p className="text-xs text-warm-muted p-6 bg-white rounded-2xl border border-warm-border">
            Belum ada kamar yang terdaftar untuk properti ini.
          </p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={(r) => setSelectedRoomForBooking(r)}
                onViewCalendar={(r) => {
                  setSelectedRoomForCalendar(r);
                  document.getElementById('kalender-tarif')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Comparison Calendar Section */}
      {activeCalendarRoom && (
        <div id="kalender-tarif" className="space-y-4 pt-6 border-t border-warm-border">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-warm-dark">
              Transparansi Harga Harian
            </h2>
            <p className="text-xs text-warm-muted">
              Cek kenaikan tarif saat peak season / hari libur dan pilih rentang tanggal sewa langsung.
            </p>
          </div>

          <PriceCalendar
            room={activeCalendarRoom}
            onSelectDates={(checkIn, checkOut) => {
              setSelectedDates({ checkIn, checkOut });
              setSelectedRoomForBooking(activeCalendarRoom);
            }}
          />
        </div>
      )}

      {/* Reviews Section */}
      <div className="space-y-6 pt-6 border-t border-warm-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-warm-dark">Ulasan Tamu</h2>
            <p className="text-xs text-warm-muted">Penilaian langsung dari tamu yang pernah menginap.</p>
          </div>
        </div>

        <ReviewList reviews={property.reviews} />
      </div>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          property={property}
          room={selectedRoomForBooking}
          initialDates={selectedDates}
          onClose={() => {
            setSelectedRoomForBooking(null);
            setSelectedDates(undefined);
          }}
        />
      )}
    </div>
  );
}
