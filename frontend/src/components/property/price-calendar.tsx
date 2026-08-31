'use client';

import React, { useState } from 'react';
import { Room, PeakSeasonRate } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame 
} from 'lucide-react';

interface PriceCalendarProps {
  room: Room;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
}

export default function PriceCalendar({ room, onSelectDates }: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  const basePrice = Number(room.basePrice) || 0;
  const peakRates = room.peakSeasonRates || [];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayPriceAndStatus = (day: number) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    dateObj.setHours(0, 0, 0, 0);

    const activePeak = peakRates.find((peak) => {
      const start = new Date(peak.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(peak.endDate);
      end.setHours(0, 0, 0, 0);
      return dateObj >= start && dateObj <= end;
    });

    let finalPrice = basePrice;
    let isPeak = false;

    if (activePeak) {
      isPeak = true;
      if (activePeak.adjustmentType === 'PERCENTAGE') {
        finalPrice = basePrice * (1 + Number(activePeak.adjustmentValue) / 100);
      } else {
        finalPrice = basePrice + Number(activePeak.adjustmentValue);
      }
    }

    return { finalPrice, isPeak, reason: activePeak?.reason };
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (new Date(dateStr) > new Date(selectedStart)) {
        setSelectedEnd(dateStr);
        if (onSelectDates) onSelectDates(selectedStart, dateStr);
      } else {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      }
    }
  };

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner p-5 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-borderSubtle">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-warm-terracotta" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-warm-dark">
                Kalender Komparasi Tarif Harian
              </h3>
            </div>
            <p className="text-[11px] text-warm-muted">
              Tipe kamar: <b>{room.name}</b> (Tarif reguler: {formatCurrency(basePrice)}/malam)
            </p>
          </div>

          {/* Month Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full bg-warm-sand hover:bg-warm-border flex items-center justify-center text-warm-dark transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif text-sm font-bold text-warm-dark min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full bg-warm-sand hover:bg-warm-border flex items-center justify-center text-warm-dark transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-warm-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-white border border-warm-border" />
            <span>Tarif Reguler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
            <span className="text-warm-terracotta font-semibold">Peak Season / Musim Ramai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-warm-terracotta" />
            <span>Tanggal Dipilih</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
            <div key={d} className="text-[10px] font-bold text-warm-muted uppercase py-1">
              {d}
            </div>
          ))}

          {/* Empty prefix slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-transparent" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const { finalPrice, isPeak, reason } = getDayPriceAndStatus(day);

            const isSelected =
              dateStr === selectedStart ||
              dateStr === selectedEnd ||
              (selectedStart && selectedEnd && new Date(dateStr) > new Date(selectedStart) && new Date(dateStr) < new Date(selectedEnd));

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`h-14 sm:h-16 rounded-xl p-1 flex flex-col justify-between items-center transition-all text-left relative ${
                  isSelected
                    ? 'bg-warm-terracotta text-white shadow-cozy-sm'
                    : isPeak
                    ? 'bg-amber-50/80 hover:bg-amber-100 text-warm-dark border border-amber-200'
                    : 'bg-white hover:bg-warm-sand/80 text-warm-dark border border-warm-borderSubtle'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold">{day}</span>
                  {isPeak && !isSelected && (
                    <Flame className="w-3 h-3 text-warm-terracotta shrink-0" />
                  )}
                </div>

                <span
                  className={`text-[9px] sm:text-[10px] font-semibold truncate max-w-full ${
                    isSelected ? 'text-warm-accentLight' : isPeak ? 'text-warm-terracotta font-bold' : 'text-warm-muted'
                  }`}
                >
                  {formatCurrency(finalPrice).replace('Rp', '').trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Summary */}
        {selectedStart && (
          <div className="p-3.5 bg-warm-sand/70 rounded-2xl border border-warm-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-warm-muted">Rentang Terpilih: </span>
              <b className="text-warm-dark">{selectedStart}</b> s/d{' '}
              <b className="text-warm-dark">{selectedEnd || 'Pilih tanggal checkout'}</b>
            </div>
            {selectedStart && selectedEnd && (
              <span className="text-[11px] font-bold text-warm-terracotta">
                Klik tombol &ldquo;Pesan Kamar&rdquo; di bawah untuk melanjutkan booking.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
