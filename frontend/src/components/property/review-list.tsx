import React from 'react';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquareQuote, ShieldCheck } from 'lucide-react';

interface ReviewListProps {
  reviews?: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-warm-border text-center space-y-2">
        <MessageSquareQuote className="w-8 h-8 text-warm-muted mx-auto" />
        <h4 className="font-serif text-sm font-bold text-warm-dark">Belum Ada Ulasan</h4>
        <p className="text-xs text-warm-muted">Jadilah tamu pertama yang memberikan ulasan untuk penginapan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div key={rev.id} className="double-bezel">
          <div className="double-bezel-inner p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center font-bold text-warm-terracotta text-xs">
                  {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-warm-dark">{rev.user?.name || 'Tamu Terverifikasi'}</h4>
                  <span className="text-[10px] text-warm-muted">{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-sand/80 text-warm-dark text-xs font-bold">
                <Star className="w-3 h-3 fill-warm-accent text-warm-accent" />
                <span>{rev.rating}</span>
              </div>
            </div>

            <p className="text-xs text-warm-dark/90 leading-relaxed">{rev.comment}</p>

            {/* Tenant Reply */}
            {rev.reply && (
              <div className="p-3.5 bg-warm-sand/60 rounded-2xl border-l-2 border-warm-terracotta space-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-warm-terracotta uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tanggapan Resmi Pengelola (Host)</span>
                </div>
                <p className="text-xs text-warm-dark italic leading-relaxed">&ldquo;{rev.reply}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
