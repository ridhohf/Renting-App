'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchRoomsByProperty, 
  createTenantRoom, 
  deleteTenantRoom,
  createPeakSeasonRate,
  createRoomUnavailability
} from '@/services/tenant.service';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  BedDouble, 
  Plus, 
  Trash2, 
  CalendarRange, 
  ChevronLeft, 
  Loader2, 
  X, 
  Flame, 
  CalendarX 
} from 'lucide-react';

export default function TenantRoomsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Number(params.id);
  const queryClient = useQueryClient();

  const [addRoomModal, setAddRoomModal] = useState(false);
  const [selectedRoomForPeak, setSelectedRoomForPeak] = useState<Room | null>(null);
  const [selectedRoomForUnavail, setSelectedRoomForUnavail] = useState<Room | null>(null);

  // Add Room Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [totalUnits, setTotalUnits] = useState('1');
  const [images, setImages] = useState<FileList | null>(null);

  // Peak Season Form State
  const [peakStart, setPeakStart] = useState('');
  const [peakEnd, setPeakEnd] = useState('');
  const [adjustmentValue, setAdjustmentValue] = useState('20');
  const [adjustmentType, setAdjustmentType] = useState<'PERCENTAGE' | 'NOMINAL'>('PERCENTAGE');
  const [peakReason, setPeakReason] = useState('');

  // Unavailability Form State
  const [unavailStart, setUnavailStart] = useState('');
  const [unavailEnd, setUnavailEnd] = useState('');
  const [unavailReason, setUnavailReason] = useState('');

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['tenantRooms', propertyId],
    queryFn: () => fetchRoomsByProperty(propertyId),
    enabled: !!propertyId,
  });

  const createRoomMutation = useMutation({
    mutationFn: (formData: FormData) => createTenantRoom(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantRooms', propertyId] });
      setAddRoomModal(false);
      setName('');
      setDescription('');
      setBasePrice('');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: number) => deleteTenantRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenantRooms', propertyId] }),
  });

  const peakMutation = useMutation({
    mutationFn: (data: any) => createPeakSeasonRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantRooms', propertyId] });
      setSelectedRoomForPeak(null);
    },
  });

  const unavailMutation = useMutation({
    mutationFn: (data: any) => createRoomUnavailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantRooms', propertyId] });
      setSelectedRoomForUnavail(null);
    },
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('propertyId', String(propertyId));
    formData.append('name', name);
    formData.append('description', description);
    formData.append('basePrice', basePrice);
    formData.append('capacity', capacity);
    formData.append('totalUnits', totalUnits);

    if (images) {
      Array.from(images).forEach((file) => formData.append('images', file));
    }
    createRoomMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Back and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/tenant/properties')}
            className="inline-flex items-center gap-1 text-xs font-bold text-warm-muted hover:text-warm-terracotta"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Properti
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Kelola Tipe Kamar & Tarif</h1>
        </div>

        <button
          onClick={() => setAddRoomModal(true)}
          className="px-5 py-2.5 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Kamar
        </button>
      </div>

      {/* Room List */}
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-warm-terracotta mx-auto" /></div>
      ) : rooms.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-warm-border text-center space-y-3">
          <BedDouble className="w-10 h-10 text-warm-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-warm-dark">Belum Ada Kamar</h3>
          <p className="text-xs text-warm-muted">Tambahkan tipe kamar (seperti Deluxe Room, Standard Room) untuk properti ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id} className="double-bezel">
              <div className="double-bezel-inner p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-warm-dark">{room.name}</h3>
                    <p className="text-xs text-warm-muted">Kapasitas {room.capacity} Tamu • Stok {room.totalUnits} Unit</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-warm-terracotta block">{formatCurrency(room.basePrice)}</span>
                    <span className="text-[10px] text-warm-muted">/ malam</span>
                  </div>
                </div>

                <p className="text-xs text-warm-muted">{room.description}</p>

                <div className="pt-3 border-t border-warm-borderSubtle flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRoomForPeak(room)}
                      className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5 hover:bg-amber-100"
                    >
                      <Flame className="w-3.5 h-3.5 text-warm-terracotta" /> Atur Peak Season (+%)
                    </button>
                    <button
                      onClick={() => setSelectedRoomForUnavail(room)}
                      className="px-3 py-1.5 rounded-full bg-warm-sand text-warm-dark font-semibold flex items-center gap-1.5 hover:bg-warm-border"
                    >
                      <CalendarX className="w-3.5 h-3.5 text-warm-muted" /> Blackout Tanggal
                    </button>
                  </div>

                  <button
                    onClick={() => { if (confirm(`Hapus kamar "${room.name}"?`)) deleteRoomMutation.mutate(room.id); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {addRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAddRoomModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center"><X className="w-4 h-4" /></button>
            <h2 className="font-serif text-xl font-bold text-warm-dark">Tambah Tipe Kamar Baru</h2>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Nama Kamar</label>
                <input type="text" required placeholder="Nama tipe kamar" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold block mb-1">Harga Dasar/Mlm</label>
                  <input type="number" required placeholder="Harga per malam" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Kapasitas Tamu</label>
                  <input type="number" required min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Total Unit Kamar</label>
                  <input type="number" required min="1" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Deskripsi Kamar</label>
                <textarea rows={2} required placeholder="Deskripsi fasilitas kamar..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Foto Kamar</label>
                <input type="file" multiple accept="image/jpeg,image/png" onChange={(e) => setImages(e.target.files)} className="w-full text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAddRoomModal(false)} className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold">Batal</button>
                <button type="submit" disabled={createRoomMutation.isPending} className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm">{createRoomMutation.isPending ? 'Menyimpan...' : 'Simpan Kamar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Peak Season Modal */}
      {selectedRoomForPeak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border relative">
            <button onClick={() => setSelectedRoomForPeak(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center"><X className="w-4 h-4" /></button>
            <h3 className="font-serif text-lg font-bold text-warm-dark">Atur Peak Season Rate</h3>
            <p className="text-xs text-warm-muted">{selectedRoomForPeak.name}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              peakMutation.mutate({
                roomId: selectedRoomForPeak.id,
                startDate: peakStart,
                endDate: peakEnd,
                adjustmentType,
                adjustmentValue: Number(adjustmentValue),
                reason: peakReason || 'Libur Musim Ramai',
              });
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold block mb-1">Tgl Mulai</label><input type="date" required value={peakStart} onChange={(e) => setPeakStart(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
                <div><label className="text-xs font-semibold block mb-1">Tgl Berakhir</label><input type="date" required value={peakEnd} onChange={(e) => setPeakEnd(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold block mb-1">Tipe Penyesuaian</label><select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value as any)} className="w-full px-3 py-2 text-xs border rounded-xl"><option value="PERCENTAGE">Persentase (%)</option><option value="NOMINAL">Nominal (Rp)</option></select></div>
                <div><label className="text-xs font-semibold block mb-1">Nilai Kenaikan</label><input type="number" required value={adjustmentValue} onChange={(e) => setAdjustmentValue(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
              </div>
              <div><label className="text-xs font-semibold block mb-1">Keterangan / Alasan</label><input type="text" placeholder="Keterangan musim ramai" value={peakReason} onChange={(e) => setPeakReason(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedRoomForPeak(null)} className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold">Batal</button>
                <button type="submit" disabled={peakMutation.isPending} className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm">{peakMutation.isPending ? 'Menyimpan...' : 'Simpan Tarif'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blackout / Unavailability Modal */}
      {selectedRoomForUnavail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border relative">
            <button onClick={() => setSelectedRoomForUnavail(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center"><X className="w-4 h-4" /></button>
            <h3 className="font-serif text-lg font-bold text-warm-dark">Atur Tanggal Tidak Tersedia (Blackout)</h3>
            <p className="text-xs text-warm-muted">{selectedRoomForUnavail.name}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              unavailMutation.mutate({
                roomId: selectedRoomForUnavail.id,
                startDate: unavailStart,
                endDate: unavailEnd,
                reason: unavailReason || 'Renovasi Kamar',
              });
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold block mb-1">Tgl Mulai</label><input type="date" required value={unavailStart} onChange={(e) => setUnavailStart(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
                <div><label className="text-xs font-semibold block mb-1">Tgl Berakhir</label><input type="date" required value={unavailEnd} onChange={(e) => setUnavailEnd(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
              </div>
              <div><label className="text-xs font-semibold block mb-1">Alasan Penutupan</label><input type="text" placeholder="Alasan penutupan kamar" value={unavailReason} onChange={(e) => setUnavailReason(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedRoomForUnavail(null)} className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold">Batal</button>
                <button type="submit" disabled={unavailMutation.isPending} className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm">{unavailMutation.isPending ? 'Menyimpan...' : 'Tutup Kamar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
