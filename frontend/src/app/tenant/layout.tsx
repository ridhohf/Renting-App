'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Building2, 
  Layers, 
  CalendarDays, 
  BarChart3, 
  LayoutDashboard, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isTenant, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isTenant)) {
      router.push('/auth/login');
    }
  }, [user, isTenant, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen pt-32 text-center text-xs text-warm-muted">Memverifikasi akses host...</div>;
  }

  const navItems = [
    { label: 'Ringkasan', href: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'Kelola Properti', href: '/tenant/properties', icon: Building2 },
    { label: 'Kategori Properti', href: '/tenant/categories', icon: Layers },
    { label: 'Pesanan & Pembayaran', href: '/tenant/orders', icon: CalendarDays },
    { label: 'Laporan Penjualan', href: '/tenant/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-warm-mesh pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            <div className="double-bezel">
              <div className="double-bezel-inner p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-warm-borderSubtle">
                  <div className="w-8 h-8 rounded-full bg-warm-terracotta flex items-center justify-center text-white text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-warm-dark truncate">{user.name}</h3>
                    <span className="text-[10px] text-warm-terracotta font-semibold uppercase">Tenant Host</span>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-warm-terracotta text-white shadow-cozy-sm'
                            : 'text-warm-muted hover:bg-warm-sand hover:text-warm-dark'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-warm-borderSubtle">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-warm-muted hover:text-warm-terracotta transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
