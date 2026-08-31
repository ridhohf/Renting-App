'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicProperties, PropertyQueryParams } from '@/services/property.service';
import PropertyCard from './property-card';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Home 
} from 'lucide-react';

interface PropertyCatalogProps {
  initialSearch?: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

const CATEGORIES = [
  { id: 0, name: 'Semua Tipe' },
  { id: 1, name: 'Hotel' },
  { id: 2, name: 'Villa' },
  { id: 3, name: 'Apartment' },
  { id: 4, name: 'Guesthouse' },
];

export default function PropertyCatalog({ initialSearch }: PropertyCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const queryParams: PropertyQueryParams = {
    page,
    limit: 6,
    city: initialSearch?.city || undefined,
    checkIn: initialSearch?.checkIn || undefined,
    checkOut: initialSearch?.checkOut || undefined,
    guests: initialSearch?.guests || undefined,
    categoryId: selectedCategory > 0 ? selectedCategory : undefined,
    search: searchName || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => fetchPublicProperties(queryParams),
  });

  const properties = data?.properties || [];
  const meta = data?.meta || { page: 1, limit: 6, total: 0, totalPages: 1 };

  return (
    <section id="katalog" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-sand text-warm-terracotta text-[11px] font-semibold uppercase tracking-wider">
            <Home className="w-3.5 h-3.5" />
            <span>Katalog Penginapan Tersedia</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-warm-dark">
            Rekomendasi Tempat Menginap
          </h2>
          <p className="text-xs sm:text-sm text-warm-muted">
            {initialSearch?.city
              ? `Menampilkan pilihan terbaik di kota "${initialSearch.city}"`
              : 'Jelajahi berbagai tipe akomodasi pilihan dengan harga transparan.'}
          </p>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search by Name */}
          <div className="relative">
            <Search className="w-4 h-4 text-warm-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama properti..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 text-xs rounded-full bg-white border border-warm-border text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm w-44 sm:w-56"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-warm-border rounded-full px-3 py-1.5 shadow-cozy-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-warm-terracotta" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as ['price' | 'name', 'asc' | 'desc'];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-warm-dark focus:outline-none cursor-pointer"
            >
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Termahal</option>
              <option value="name-asc">Nama: A - Z</option>
              <option value="name-desc">Nama: Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-warm-terracotta text-white shadow-cozy-sm'
                : 'bg-warm-sand/80 text-warm-dark hover:bg-warm-sand border border-warm-borderSubtle'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Property Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="double-bezel animate-pulse">
              <div className="double-bezel-inner h-96 bg-warm-sand/40" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-warm-border p-8 max-w-md mx-auto space-y-3">
          <p className="text-sm font-semibold text-warm-dark">Katalog sedang diperbarui</p>
          <p className="text-xs text-warm-muted">Silakan muat ulang halaman atau periksa koneksi Anda.</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-warm-border p-8 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-warm-sand mx-auto flex items-center justify-center text-warm-terracotta">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-warm-dark">Tidak Ada Properti Ditemukan</h3>
          <p className="text-xs text-warm-muted max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, pilih kota lain, atau reset filter kategori untuk melihat hasil lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Server-Side Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full bg-white border border-warm-border text-warm-dark flex items-center justify-center shadow-cozy-sm hover:bg-warm-sand disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                page === p
                  ? 'bg-warm-terracotta text-white shadow-cozy-sm'
                  : 'bg-white border border-warm-border text-warm-dark hover:bg-warm-sand'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
            disabled={page === meta.totalPages}
            className="w-10 h-10 rounded-full bg-white border border-warm-border text-warm-dark flex items-center justify-center shadow-cozy-sm hover:bg-warm-sand disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
