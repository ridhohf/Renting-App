'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Star, Users, ArrowUpRight } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

export default function PropertyCard({ property }: PropertyCardProps) {
  const coverImage =
    property.images && property.images.length > 0
      ? property.images[0].imageUrl
      : DEFAULT_IMAGE;

  const lowestPrice = property.lowestPrice || 0;
  const rating = property.avgRating ? Number(property.avgRating).toFixed(1) : 'Baru';
  const reviewCount = property.reviews ? property.reviews.length : 0;

  return (
    <div className="double-bezel group hover:-translate-y-1 transition-all duration-500 ease-spring-smooth">
      <div className="double-bezel-inner overflow-hidden flex flex-col h-full">
        {/* Cover Image Container */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-spring-smooth"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Category Badge */}
          {property.category && (
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-warm-terracotta shadow-cozy-sm">
                {property.category.name}
              </span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-dark/80 backdrop-blur-md text-[11px] font-bold text-warm-accentLight">
              <Star className="w-3 h-3 fill-warm-accent text-warm-accent" />
              <span>{rating}</span>
              {reviewCount > 0 && <span className="text-white/60 text-[10px]">({reviewCount})</span>}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-warm-muted">
              <MapPin className="w-3.5 h-3.5 text-warm-terracotta shrink-0" />
              <span className="truncate">{property.city}, {property.province}</span>
            </div>

            <h3 className="font-serif text-base sm:text-lg font-bold text-warm-dark group-hover:text-warm-terracotta transition-colors line-clamp-1">
              {property.name}
            </h3>

            <p className="text-xs text-warm-muted line-clamp-2 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Price & CTA Button */}
          <div className="pt-3 border-t border-warm-borderSubtle flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-warm-muted block">Mulai dari</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-base sm:text-lg font-bold text-warm-dark">
                  {lowestPrice > 0 ? formatCurrency(lowestPrice) : 'Cek Jadwal'}
                </span>
                {lowestPrice > 0 && <span className="text-[10px] text-warm-muted">/mlm</span>}
              </div>
            </div>

            <Link
              href={`/properties/${property.slug}`}
              className="group/btn pl-3 pr-1 py-1 rounded-full bg-warm-sand group-hover:bg-warm-terracotta text-warm-dark group-hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
            >
              <span>Detail</span>
              <div className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300">
                <ArrowUpRight className="w-3 h-3 text-warm-dark group-hover:text-white" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
