'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MapPin, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface CarouselSlide {
  id: number;
  title: string;
  category: string;
  location: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  image: string;
  tag: string;
  description: string;
}

const FEATURED_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title: 'Villa Sunset Serenity & Private Pool',
    category: 'Luxury Villa',
    location: 'Uluwatu, Bali',
    pricePerNight: 1250000,
    rating: 4.95,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
    tag: 'Pilihan Terpopuler',
    description: 'Vila bernuansa kayu jati hangat dengan infinity pool langsung menghadap samudra Hindia.',
  },
  {
    id: 2,
    title: 'Pine Forest Heritage Cabin & Fireplace',
    category: 'Cozy Cabin',
    location: 'Lembang, Bandung',
    pricePerNight: 650000,
    rating: 4.9,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
    tag: 'Suasana Sejuk',
    description: 'Kabin kayu estetik di tengah rimbunnya hutan pinus dengan perapian hangat untuk istirahat tenang.',
  },
  {
    id: 3,
    title: 'Minimalist Boutique Loft Suites',
    category: 'Boutique Hotel',
    location: 'Prawirotaman, Yogyakarta',
    pricePerNight: 480000,
    rating: 4.88,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80',
    tag: 'Sentuhan Budaya',
    description: 'Desain interior warm minimalis berpadu ornamen lokal, dekat galeri seni dan kuliner khas.',
  },
  {
    id: 4,
    title: 'Urban Oasis Penthouse & Sky Terrace',
    category: 'Modern Apartment',
    location: 'Sudirman, Jakarta',
    pricePerNight: 890000,
    rating: 4.92,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    tag: 'Pemandangan Kota',
    description: 'Apartemen sudut dengan pencahayaan hangat alami, bathtub estetik, dan panorama kota metropolitan.',
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
  };

  const current = FEATURED_SLIDES[currentIndex];

  return (
    <section 
      className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Eyebrow Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-warm-sand border border-warm-border text-warm-terracotta text-[11px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-warm-terracotta" />
          <span>Penginapan Pilihan Hangat & Nyaman</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-warm-dark leading-tight">
          Temukan Ruang Beristirahat <br className="hidden sm:block" />
          <span className="text-warm-terracotta italic font-normal">Penuh Kehangatan</span>
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
          Pilihan vila butik, kabin sejuk, dan kamar estetik dengan harga transparan menyesuaikan tanggal liburan Anda.
        </p>
      </div>

      {/* Double-Bezel Hardware Carousel Container */}
      <div className="double-bezel shadow-cozy-lg relative group">
        <div className="double-bezel-inner relative overflow-hidden h-[360px] sm:h-[480px] w-full">
          {/* Slide Image with Smooth Transition */}
          <Image
            src={current.image}
            alt={current.title}
            fill
            priority
            className="object-cover transition-transform duration-700 ease-spring-smooth group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
          />

          {/* Dark Warm Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/90 via-warm-dark/30 to-transparent" />

          {/* Slide Badge Tag */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-warm-terracotta text-xs font-bold shadow-cozy-sm">
              <span className="w-2 h-2 rounded-full bg-warm-terracotta animate-pulse" />
              {current.tag}
            </span>
          </div>

          {/* Slide Details Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl text-white">
              <div className="flex items-center gap-3 text-xs text-warm-sand/90">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm font-medium">
                  {current.category}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-warm-accent" />
                  <span>{current.location}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-warm-accentLight">
                  <Star className="w-3.5 h-3.5 fill-warm-accent text-warm-accent" />
                  <span>{current.rating}</span>
                  <span className="text-white/70">({current.reviewCount})</span>
                </div>
              </div>

              <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-white line-clamp-1">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-warm-sand/80 line-clamp-2 sm:line-clamp-1">
                {current.description}
              </p>
            </div>

            {/* Price & Action Button */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0">
              <div className="sm:text-right">
                <span className="text-[11px] text-warm-sand/80 block">Mulai dari</span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-warm-accentLight">
                  {formatCurrency(current.pricePerNight)}
                </span>
                <span className="text-[10px] text-warm-sand/70 block">/ malam</span>
              </div>

              <Link
                href="/#katalog"
                className="group/btn pl-4 pr-1.5 py-1.5 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-semibold flex items-center gap-2 shadow-cozy-md transition-all duration-300"
              >
                <span>Lihat Kamar</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation Prev & Next Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-warm-dark flex items-center justify-center backdrop-blur-md shadow-cozy-md transition-all duration-300 hover:scale-105"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 text-warm-dark" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-warm-dark flex items-center justify-center backdrop-blur-md shadow-cozy-md transition-all duration-300 hover:scale-105"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 text-warm-dark" />
          </button>

          {/* Progress Indicators */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-1.5 z-10">
            {FEATURED_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === idx ? 'w-6 bg-warm-accent' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
