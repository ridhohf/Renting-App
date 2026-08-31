'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  Search, 
  ChevronDown 
} from 'lucide-react';

interface SearchBarProps {
  onSearch: (params: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
}

const POPULAR_CITIES = [
  'Semua Kota',
  'Jakarta',
  'Denpasar',
  'Bali',
  'Bandung',
  'Yogyakarta',
  'Surabaya',
  'Malang',
  'Bogor',
];

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: city === 'Semua Kota' ? '' : city,
      checkIn,
      checkOut,
      guests,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-4 z-20">
      <form
        onSubmit={handleSubmit}
        className="glass-island rounded-3xl sm:rounded-full p-2.5 sm:p-3 shadow-cozy-lg border border-warm-border grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-1 items-center"
      >
        {/* Destination City */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-warm-sand/50 transition-colors">
          <MapPin className="w-5 h-5 text-warm-terracotta shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wider font-bold text-warm-muted block">
              Destinasi
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-warm-dark focus:outline-none cursor-pointer"
            >
              <option value="">Pilih Kota Tujuan</option>
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Check In Date */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-warm-sand/50 transition-colors border-t sm:border-t-0 sm:border-l border-warm-borderSubtle">
          <CalendarIcon className="w-5 h-5 text-warm-terracotta shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wider font-bold text-warm-muted block">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-warm-dark focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Check Out Date */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-warm-sand/50 transition-colors border-t sm:border-t-0 sm:border-l border-warm-borderSubtle">
          <CalendarIcon className="w-5 h-5 text-warm-terracotta shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wider font-bold text-warm-muted block">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-warm-dark focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Guests & Search Button */}
        <div className="flex items-center justify-between gap-2 pl-4 pr-1.5 py-1.5 rounded-2xl border-t sm:border-t-0 sm:border-l border-warm-borderSubtle relative">
          <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}>
            <Users className="w-5 h-5 text-warm-terracotta shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-warm-muted block cursor-pointer">
                Tamu
              </label>
              <div className="text-xs font-semibold text-warm-dark flex items-center gap-1">
                <span>{guests} Orang</span>
                <ChevronDown className="w-3.5 h-3.5 text-warm-muted" />
              </div>
            </div>
          </div>

          {/* Guest Count Dropdown */}
          {guestDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-48 bg-white rounded-2xl p-3 shadow-cozy-lg border border-warm-border z-30 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-warm-dark mb-2">Jumlah Tamu</p>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full bg-warm-sand text-warm-dark font-bold hover:bg-warm-border flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="text-sm font-bold text-warm-dark">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                  className="w-8 h-8 rounded-full bg-warm-terracotta text-white font-bold hover:bg-warm-terracottaHover flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white flex items-center justify-center shrink-0 shadow-cozy-md hover:scale-105 transition-all duration-300 ease-spring-smooth"
            aria-label="Cari Penginapan"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
