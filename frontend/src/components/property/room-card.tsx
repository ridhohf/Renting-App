'use client';

import React from 'react';
import Image from 'next/image';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Users, BedDouble, Sparkles, ArrowRight, CalendarRange } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
  onViewCalendar: (room: Room) => void;
}

const DEFAULT_ROOM_IMG =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

export default function RoomCard({ room, onBook, onViewCalendar }: RoomCardProps) {
  const roomImage = room.images && room.images.length > 0 ? room.images[0].imageUrl : DEFAULT_ROOM_IMG;
  const basePrice = Number(room.basePrice) || 0;

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-center">
        {/* Room Image */}
        <div className="relative h-44 sm:h-48 w-full md:w-64 rounded-2xl overflow-hidden shrink-0">
          <Image
            src={roomImage}
            alt={room.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-warm-dark">{room.name}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-warm-sand font-semibold text-warm-terracotta">
              Sisa {room.totalUnits} Unit
            </span>
          </div>

          <p className="text-xs text-warm-muted leading-relaxed line-clamp-2">
            {room.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-warm-muted">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-warm-terracotta" />
              <span>Kapasitas {room.capacity} Orang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-warm-terracotta" />
              <span>Tempat Tidur Nyaman</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-warm-borderSubtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-warm-muted block">Tarif Reguler</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-lg sm:text-xl font-bold text-warm-terracotta">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-[10px] text-warm-muted">/ malam</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewCalendar(room)}
                className="px-3.5 py-2 rounded-full bg-warm-sand text-warm-dark text-xs font-semibold hover:bg-warm-border transition-colors flex items-center gap-1.5"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Cek Kalender</span>
              </button>

              <button
                type="button"
                onClick={() => onBook(room)}
                className="px-5 py-2 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-sm flex items-center gap-1.5 transition-all"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
