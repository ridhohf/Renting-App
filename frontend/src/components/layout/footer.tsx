import React from 'react';
import Link from 'next/link';
import StayInnLogo from '@/components/common/stayinn-logo';
import { Heart, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-warm-dark text-warm-sand/90 pt-16 pb-12 border-t border-warm-espresso">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-warm-espresso/80">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/">
              <StayInnLogo size="lg" className="[&>span]:text-white" />
            </Link>
            <p className="text-xs text-warm-sand/70 leading-relaxed">
              Platform sewa penginapan dengan konsep warm & cozy. Temukan vila tenang, hotel butik, dan kamar nyaman dengan transparansi harga terbaik.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white mb-4">Destinasi Favorit</h4>
            <ul className="space-y-2.5 text-xs text-warm-sand/70">
              <li><Link href="/?city=Bali" className="hover:text-warm-accent transition-colors">Vila Tenang di Bali</Link></li>
              <li><Link href="/?city=Bandung" className="hover:text-warm-accent transition-colors">Penginapan Sejuk Bandung</Link></li>
              <li><Link href="/?city=Yogyakarta" className="hover:text-warm-accent transition-colors">Guesthouse Budaya Yogya</Link></li>
              <li><Link href="/?city=Jakarta" className="hover:text-warm-accent transition-colors">Apartemen Nyaman Jakarta</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white mb-4">Fitur & Layanan</h4>
            <ul className="space-y-2.5 text-xs text-warm-sand/70">
              <li><Link href="/#katalog" className="hover:text-warm-accent transition-colors">Katalog Kamar & Vila</Link></li>
              <li><Link href="/#kalender" className="hover:text-warm-accent transition-colors">Komparasi Harga Kalender</Link></li>
              <li><Link href="/auth/register" className="hover:text-warm-accent transition-colors">Daftar Menjadi Tenant Host</Link></li>
              <li><Link href="/terms" className="hover:text-warm-accent transition-colors">Syarat & Kebijakan Sewa</Link></li>
            </ul>
          </div>

          {/* Guarantee Badges */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white mb-4">Jaminan StayInn</h4>
            <div className="flex items-center gap-2.5 text-xs text-warm-sand/80">
              <ShieldCheck className="w-4 h-4 text-warm-accent shrink-0" />
              <span>Verifikasi Host & Pembayaran Aman</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-warm-sand/80">
              <Clock className="w-4 h-4 text-warm-accent shrink-0" />
              <span>Konfirmasi Cepat 1 Jam</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-warm-sand/80">
              <MapPin className="w-4 h-4 text-warm-accent shrink-0" />
              <span>Lokasi Akurat Geolocation</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-sand/50">
          <p>© 2026 StayInn Property Renting Web App. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Dirancang dengan suasana hangat & nyaman</span>
            <Heart className="w-3.5 h-3.5 text-warm-terracotta fill-warm-terracotta" />
          </div>
        </div>
      </div>
    </footer>
  );
}
