import React from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Coffee, 
  HeartHandshake 
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarRange,
    title: 'Komparasi Kalender Cerdas',
    description: 'Bandingkan tarif harian dalam satu bulan penuh. Lihat langsung penyesuaian harga hari libur dan peak season tanpa biaya tersembunyi.',
    tag: 'Transparansi Tarif',
  },
  {
    icon: Coffee,
    title: 'Koleksi Ruang Warm & Cozy',
    description: 'Setiap vila, hotel butik, dan kabin dipilih dengan standar kenyamanan tinggi, interior estetis, dan nuansa relaksasi yang menenangkan.',
    tag: 'Kurasi Estetik',
  },
  {
    icon: ShieldCheck,
    title: 'Proses Booking Cepat & Terpercaya',
    description: 'Konfirmasi pembayaran instan dalam 1 jam, sistem verifikasi host terpercaya, dan notifikasi pengingat H-1 otomatis langsung ke email.',
    tag: 'Keamanan Transaksi',
  },
  {
    icon: TrendingUp,
    title: 'Ekosistem Lengkap untuk Tenant',
    description: 'Dashboard khusus pemilik properti untuk mengatur stok kamar, tarif seasonal rate dinamis, laporan analitik, dan respon ulasan tamu.',
    tag: 'Pemberdayaan Host',
  },
];

export default function FeaturesSection() {
  return (
    <section id="keunggulan" className="bg-warm-sand/50 py-20 sm:py-28 border-y border-warm-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-warm-border text-warm-terracotta text-[11px] font-semibold uppercase tracking-wider shadow-cozy-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pengalaman Menginap Istimewa</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-warm-dark">
            Mengapa Memilih StayInn?
          </h2>
          <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
            Menghadirkan kehangatan dalam setiap perjalanan dengan kenyamanan pemesanan dan keterbukaan harga terbaik.
          </p>
        </div>

        {/* 4 Feature Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="double-bezel group hover:-translate-y-1 transition-all duration-500 ease-spring-smooth">
                <div className="double-bezel-inner p-6 sm:p-8 flex flex-col justify-between h-full space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-warm-sand flex items-center justify-center text-warm-terracotta group-hover:scale-110 transition-transform duration-500 ease-spring-smooth">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-warm-sand/60 text-warm-muted text-[10px] font-bold uppercase tracking-wider">
                      {feat.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-warm-dark group-hover:text-warm-terracotta transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
