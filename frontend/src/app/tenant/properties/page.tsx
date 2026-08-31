'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTenantPropertyList, 
  fetchTenantCategories, 
  createTenantProperty, 
  deleteTenantProperty 
} from '@/services/tenant.service';
import { 
  Building2, 
  Plus, 
  Trash2, 
  BedDouble, 
  MapPin, 
  Loader2, 
  X, 
  AlertCircle 
} from 'lucide-react';

export default function TenantPropertiesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<FileList | null>(null);

  const { data: propData, isLoading } = useQuery({
    queryKey: ['tenantProperties'],
    queryFn: () => fetchTenantPropertyList(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['tenantCategories'],
    queryFn: fetchTenantCategories,
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createTenantProperty(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantProperties'] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => setError(err.message || 'Gagal membuat properti'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTenantProperty(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenantProperties'] }),
  });

  const resetForm = () => {
    setName('');
    setCategoryId('');
    setDescription('');
    setCity('');
    setProvince('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setImages(null);
    setError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Pilih kategori properti terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryId', categoryId);
    formData.append('description', description);
    formData.append('city', city);
    formData.append('province', province);
    formData.append('address', address);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append('images', file);
      });
    }

    createMutation.mutate(formData);
  };

  const properties = propData?.properties || [];

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Kelola Properti</h1>
          <p className="text-xs text-warm-muted">Daftar penginapan milik Anda dan pengaturan tipe kamar.</p>
        </div>

        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="px-5 py-2.5 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-sm flex items-center gap-2 transition-all shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Properti Baru</span>
        </button>
      </div>

      {/* Property List Grid */}
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-warm-terracotta mx-auto" /></div>
      ) : properties.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-warm-border text-center space-y-3">
          <Building2 className="w-10 h-10 text-warm-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-warm-dark">Belum Ada Properti</h3>
          <p className="text-xs text-warm-muted">Mulai daftarkan penginapan Anda untuk menerima tamu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((prop) => (
            <div key={prop.id} className="double-bezel">
              <div className="double-bezel-inner p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-warm-dark line-clamp-1">{prop.name}</h3>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus properti "${prop.name}" beserta semua kamar & gambarnya?`)) {
                        deleteMutation.mutate(prop.id);
                      }
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-warm-muted">
                  <MapPin className="w-3.5 h-3.5 text-warm-terracotta shrink-0" />
                  <span className="truncate">{prop.address}, {prop.city}, {prop.province}</span>
                </div>

                <p className="text-xs text-warm-muted line-clamp-2">{prop.description}</p>

                <div className="pt-3 border-t border-warm-borderSubtle flex items-center justify-between text-xs">
                  <span className="text-warm-muted">{prop._count?.rooms || 0} Tipe Kamar</span>
                  <Link
                    href={`/tenant/properties/${prop.id}/rooms`}
                    className="px-4 py-1.5 rounded-full bg-warm-sand text-warm-dark hover:bg-warm-terracotta hover:text-white font-bold flex items-center gap-1.5 transition-all"
                  >
                    <BedDouble className="w-3.5 h-3.5" />
                    <span>Kelola Kamar & Tarif</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Property Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-cozy-lg border border-warm-border max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-warm-sand flex items-center justify-center text-warm-dark"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-serif text-xl font-bold text-warm-dark">Tambah Properti Baru</h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Nama Properti</label>
                <input
                  type="text"
                  required
                  placeholder="Nama properti atau vila"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Kategori</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Kota</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama kota"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama provinsi"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Alamat lengkap lokasi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Deskripsi Properti</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Deskripsi fasilitas dan keunggulan properti..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-warm-border rounded-xl focus:ring-1 focus:ring-warm-terracotta"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Upload Foto Properti</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={(e) => setImages(e.target.files)}
                  className="w-full text-xs text-warm-dark file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-warm-sand file:text-xs file:font-semibold"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-warm-sand text-xs font-bold text-warm-dark"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-full bg-warm-terracotta text-xs font-bold text-white shadow-cozy-sm hover:bg-warm-terracottaHover disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan Properti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
