'use client';

import React, { useState } from 'react';
import HeroCarousel from '@/components/home/hero-carousel';
import SearchBar from '@/components/home/search-bar';
import PropertyCatalog from '@/components/home/property-catalog';
import FeaturesSection from '@/components/home/features-section';

export default function HomePage() {
  const [searchParams, setSearchParams] = useState<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  const handleSearch = (params: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    setSearchParams(params);
    const catalogElement = document.getElementById('katalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      {/* 1. Hero Featured Carousel */}
      <HeroCarousel />

      {/* 2. Floating Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* 3. Property Catalog & Server-Side Filtered Grid */}
      <PropertyCatalog initialSearch={searchParams} />

      {/* 4. Why StayInn Features Bento Section */}
      <FeaturesSection />
    </div>
  );
}
