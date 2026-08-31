import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/query-provider';
import { AuthProvider } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'StayInn — Penginapan Hangat & Nyaman dengan Komparasi Harga',
  description:
    'Sewa vila, hotel butik, dan kamar nyaman dengan transparansi komparasi harga kalender harian di StayInn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth font-sans">
      <body className="min-h-screen bg-background font-sans flex flex-col justify-between">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
