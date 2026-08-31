'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StayInnLogo from '@/components/common/stayinn-logo';
import { useAuth } from '@/context/auth-context';
import { 
  Sparkles, 
  Menu, 
  X, 
  User as UserIcon, 
  Building2, 
  CalendarDays, 
  LogOut, 
  ArrowUpRight 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isTenant } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-5 pointer-events-none">
      <nav className="max-w-6xl mx-auto glass-island rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto transition-all duration-500 ease-spring-smooth">
        {/* Brand Logo */}
        <Link href="/">
          <StayInnLogo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-warm-muted">
          <Link href="/#katalog" className="hover:text-warm-terracotta transition-colors">
            Jelajahi Penginapan
          </Link>
          <Link href="/#keunggulan" className="hover:text-warm-terracotta transition-colors">
            Keunggulan
          </Link>
          <Link href="/#destinasi" className="hover:text-warm-terracotta transition-colors">
            Kota Populer
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full bg-warm-sand/70 hover:bg-warm-sand border border-warm-border transition-all duration-300 ease-spring-smooth"
              >
                <span className="text-xs font-semibold text-warm-dark max-w-[120px] truncate">
                  {user.name}
                </span>
                <div className="w-7 h-7 rounded-full bg-warm-terracotta/10 flex items-center justify-center text-warm-terracotta font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-cozy-lg border border-warm-border/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-3 py-2 border-b border-warm-borderSubtle">
                    <p className="text-xs text-warm-muted">Login sebagai</p>
                    <p className="text-xs font-bold text-warm-dark truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warm-terracotta/10 text-warm-terracotta uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {isTenant ? (
                      <Link
                        href="/tenant/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-warm-dark hover:bg-warm-sand/60 rounded-xl transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-warm-terracotta" />
                        Dashboard Kelola Properti
                      </Link>
                    ) : (
                      <Link
                        href="/user/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-warm-dark hover:bg-warm-sand/60 rounded-xl transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-warm-terracotta" />
                        Riwayat Pesanan Saya
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-warm-dark hover:bg-warm-sand/60 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-warm-terracotta" />
                      Profil Akun
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-warm-borderSubtle">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-semibold text-warm-dark hover:text-warm-terracotta transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="group pl-4 pr-1.5 py-1.5 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-medium flex items-center gap-2 shadow-cozy-sm hover:shadow-cozy-md transition-all duration-300 ease-spring-smooth"
              >
                <span>Daftar</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-full bg-warm-sand/80 flex items-center justify-center text-warm-dark"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 p-4 rounded-3xl glass-island pointer-events-auto shadow-cozy-lg border border-warm-border animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-3 text-sm font-medium text-warm-dark pb-3 border-b border-warm-borderSubtle">
            <Link
              href="/#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-warm-sand/70 transition-colors"
            >
              Jelajahi Penginapan
            </Link>
            <Link
              href="/#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-warm-sand/70 transition-colors"
            >
              Keunggulan
            </Link>
            <Link
              href="/#destinasi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-warm-sand/70 transition-colors"
            >
              Kota Populer
            </Link>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-1">
                  <p className="text-xs font-bold text-warm-dark">{user.name}</p>
                  <p className="text-[11px] text-warm-muted">{user.email}</p>
                </div>
                {isTenant ? (
                  <Link
                    href="/tenant/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-warm-terracotta/10 text-warm-terracotta"
                  >
                    Dashboard Tenant
                  </Link>
                ) : (
                  <Link
                    href="/user/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-warm-sand text-warm-dark"
                  >
                    Pesanan Saya
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-full bg-warm-sand text-warm-dark"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-full bg-warm-terracotta text-white"
                >
                  Daftar Akun
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
