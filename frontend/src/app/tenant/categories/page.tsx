'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTenantCategories, createTenantCategory, deleteTenantCategory } from '@/services/tenant.service';
import { Layers, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function TenantCategoriesPage() {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['tenantCategories'],
    queryFn: fetchTenantCategories,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createTenantCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantCategories'] });
      setNewCategoryName('');
      setError('');
    },
    onError: (err: any) => setError(err.message || 'Gagal menambahkan kategori'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTenantCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantCategories'] });
      setError('');
    },
    onError: (err: any) => setError(err.message || 'Gagal menghapus kategori (pastikan tidak ada properti yang menggunakan kategori ini)'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">Kategori Properti</h1>
        <p className="text-xs text-warm-muted">Kelola daftar kategori untuk mengelompokkan jenis penginapan Anda.</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Category Form */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-5 space-y-3">
          <h3 className="font-serif text-sm font-bold text-warm-dark flex items-center gap-2">
            <Plus className="w-4 h-4 text-warm-terracotta" />
            Tambah Kategori Baru
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCategoryName.trim()) createMutation.mutate(newCategoryName.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              required
              placeholder="Nama kategori baru"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:ring-1 focus:ring-warm-terracotta"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2 rounded-xl bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm hover:bg-warm-terracottaHover disabled:opacity-50"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Tambah'}
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-sm font-bold text-warm-dark">Daftar Kategori Anda</h3>
          {isLoading ? (
            <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-warm-terracotta mx-auto" /></div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-warm-muted py-4 text-center">Belum ada kategori properti dibuat.</p>
          ) : (
            <div className="divide-y divide-warm-borderSubtle">
              {categories.map((cat) => (
                <div key={cat.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-warm-terracotta" />
                    <span className="font-bold text-warm-dark">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kategori "${cat.name}"?`)) deleteMutation.mutate(cat.id);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
