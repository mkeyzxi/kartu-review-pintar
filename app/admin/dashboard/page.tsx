'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Link as LinkType } from '@/types/link';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { trackError } from '@/lib/utils/error-tracking';

/**
 * Convert various date formats to Date object.
 * Handles: string, Firestore Timestamp, plain object with _seconds/_nanoseconds, Date
 */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  // Firestore Timestamp (server-side) or serialized object (client-side)
  if (typeof value === 'object') {
    // Check for Firestore Timestamp instance (has toDate method)
    if (typeof value.toDate === 'function') return value.toDate();
    // Check for serialized Timestamp object (_seconds, _nanoseconds)
    if ('_seconds' in value && '_nanoseconds' in value) {
      return new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
    }
    // Check for seconds/nanoseconds (alternative format)
    if ('seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    }
  }
  return new Date(value);
}

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, suspended: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [storeNameInput, setStoreNameInput] = useState<Record<string, string>>({});
  const [labelInput, setLabelInput] = useState<Record<string, string>>({});
  const [urlGmbInput, setUrlGmbInput] = useState<Record<string, string>>({});
  const [expiryInput, setExpiryInput] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [customSlugs, setCustomSlugs] = useState('');
  
  const { toasts, addToast, removeToast } = useToast();

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/links?${params}`);
      const result = await response.json();

      if (result.success) {
        setLinks(result.data.data);
        setTotalPages(Math.ceil(result.data.total / 20));
      } else {
        setError(result.error || 'Gagal memuat data');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
      trackError(err as Error, { context: 'fetch_links' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/links/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      trackError(err as Error, { context: 'fetch_stats' });
    }
  }, []);

  useEffect(() => {
    fetchLinks();
    fetchStats();
  }, [fetchLinks, fetchStats]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLinks();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLinks, fetchStats]);

  // Cookie session dikirim browser secara otomatis pada setiap request

  const handleToggleSuspend = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}/suspend`, {
        method: 'POST',
      });
      fetchLinks();
      fetchStats();
    } catch (err) {
      console.error('Error toggling suspend:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const count = parseInt(formData.get('count') as string) || 1;
    const storeName = formData.get('store_name') as string || undefined;
    const customSlugsText = formData.get('custom_slugs') as string || '';
    
    // Parse custom slugs (satu per baris)
    const customSlugs = customSlugsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          count, 
          store_name: storeName,
          custom_slugs: customSlugs.length > 0 ? customSlugs : undefined
        }),
      });

      const result = await response.json();
      if (result.success) {
        addToast(result.message, 'success');
        // Reset form
        form.reset();
        setCustomSlugs('');
        // Force refresh data
        await Promise.all([fetchLinks(), fetchStats()]);
      } else {
        addToast(result.error || 'Gagal generate kartu', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan', 'error');
      trackError(err as Error, { context: 'handle_generate' });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStoreName = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store_name: storeNameInput[id] || '' }),
      });
      fetchLinks();
    } catch (err) {
      console.error('Error updating store name:', err);
    }
  };

  const handleUpdateLabel = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}/label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: labelInput[id] || '' }),
      });
      fetchLinks();
    } catch (err) {
      console.error('Error updating label:', err);
    }
  };

  const handleUpdateUrlGmb = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url_gmb: urlGmbInput[id] || '' }),
      });
      fetchLinks();
    } catch (err) {
      console.error('Error updating URL GMB:', err);
    }
  };

  const handleUpdateExpiry = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}/expiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expired_at: expiryInput[id] || null }),
      });
      fetchLinks();
    } catch (err) {
      console.error('Error updating expiry:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="card-solid p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-red border-2 border-google-text shadow-google-sm">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold-display text-google-text mb-2">ERROR</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
                className="btn-google-blue"
          >
            COBA LAGI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold-display text-google-text">ADMIN DASHBOARD</h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Pantau performa dan kelola kartu review pintar.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/admin/analytics"
            className="flex-1 sm:flex-initial bg-google-blue hover:bg-blue-600 text-white font-bold-display px-3 sm:px-4 py-2 rounded-lg border-2 border-google-blue shadow-google-sm transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">ANALYTICS</span>
            <span className="sm:hidden">DATA</span>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/admin/auth/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex-1 sm:flex-initial bg-gray-200 hover:bg-gray-300 text-google-text font-bold-display px-3 sm:px-4 py-2 rounded-lg border-2 border-google-text shadow-google-sm transition-all text-sm sm:text-base"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card-solid p-4 sm:p-6 flex flex-col">
          <span className="text-xs sm:text-sm text-gray-500 font-bold mb-1 sm:mb-2">TOTAL KARTU</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{stats.total}</span>
        </div>
        <div className="card-solid p-4 sm:p-6 flex flex-col border-google-green shadow-[4px_4px_0px_#34A853] sm:shadow-[8px_8px_0px_#34A853]">
          <span className="text-xs sm:text-sm text-google-green font-bold mb-1 sm:mb-2">SUDAH AKTIF</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{stats.active}</span>
        </div>
        <div className="card-solid p-4 sm:p-6 flex flex-col border-gray-400 shadow-[4px_4px_0px_#9CA3AF] sm:shadow-[8px_8px_0px_#9CA3AF]">
          <span className="text-xs sm:text-sm text-gray-500 font-bold mb-1 sm:mb-2">BELUM AKTIF</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{stats.inactive}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Form Generate Massal */}
        <div className="lg:col-span-1 card-solid p-4 sm:p-6 bg-gray-50 flex flex-col justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-3 sm:mb-4">GENERATE KARTU BARU</h2>
            <form onSubmit={handleGenerate} className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">NAMA TOKO (Opsional)</label>
                <input type="text" name="store_name" className="input-field bg-white text-sm" placeholder="Misal: Kopi Kenangan" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">JUMLAH KARTU</label>
                <input type="number" name="count" className="input-field bg-white text-sm" min="1" max="500" defaultValue="1" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">CUSTOM SLUG (Opsional)</label>
                <textarea
                  name="custom_slugs"
                  value={customSlugs}
                  onChange={(e) => setCustomSlugs(e.target.value)}
                  className="input-field bg-white text-sm"
                  placeholder={"Masukkan custom slug, satu per baris\nContoh:\nkopi-kenangan\ntokobagus\nmy-store"}
                  rows={4}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Kosongkan untuk generate otomatis. Maksimal 100 slug per request. Format: huruf kecil, angka, strip
                </p>
              </div>
              <button 
                type="submit" 
                className="btn-google-blue mt-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={generating}
              >
                {generating ? 'MEMPROSES...' : 'GENERATE'}
              </button>
            </form>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="lg:col-span-2 card-solid p-4 sm:p-6 bg-white flex flex-col justify-center">
          <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-3 sm:mb-4">PENCARIAN & FILTER</h2>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">CARI TOKO / SLUG</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Cari..."
                />
              </div>
              <div className="sm:w-1/3">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">STATUS</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field cursor-pointer text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Belum Aktif</option>
                  <option value="suspended">Ditangguhkan (Suspend)</option>
                  <option value="expired">Kedaluwarsa</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-google-text text-white font-bold px-4 sm:px-6 py-2 sm:py-[14px] rounded-lg border-2 border-google-text shadow-google-sm hover:bg-gray-800 text-sm sm:text-base w-full sm:w-auto">
                Terapkan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="card-solid overflow-hidden mb-6 sm:mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-google-text">
                <th className="p-2 sm:p-4 font-bold-display text-xs sm:text-sm w-24 sm:w-32">KODE</th>
                <th className="p-2 sm:p-4 font-bold-display text-xs sm:text-sm">INFO TOKO</th>
                <th className="p-2 sm:p-4 font-bold-display text-xs sm:text-sm w-32 sm:w-48">STATUS</th>
                <th className="p-2 sm:p-4 font-bold-display text-xs sm:text-sm w-48 sm:w-64">KONTROL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 sm:p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-google-blue mx-auto"></div>
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 sm:p-8 text-center text-gray-500 font-bold text-sm">Tidak ada kartu yang ditemukan.</td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-2 sm:p-4 align-top">
                      <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm font-bold block text-center border border-gray-300">{link.slug}</span>
                      <Link href={`/${link.slug}`} target="_blank" className="text-[10px] sm:text-[11px] text-google-blue font-bold hover:underline mt-2 text-center block mb-2">Test &rarr;</Link>
                       
                      <a
                        href={`/api/admin/links/${link.id}/qr`}
                        className="text-[9px] sm:text-[10px] bg-white border border-gray-300 text-gray-700 font-bold py-1 px-2 rounded block text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        QR
                      </a>

                      <div className="text-[9px] sm:text-[10px] text-gray-400 mt-2 text-center">{toDate(link.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>
                    
                    <td className="p-2 sm:p-4 align-top">
                      <div className="mb-2 sm:mb-3">
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1">NAMA TOKO:</label>
                        <div className="flex gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={storeNameInput[link.id] ?? link.storeName ?? ''}
                            onChange={(e) => setStoreNameInput({ ...storeNameInput, [link.id]: e.target.value })}
                            className="input-field !py-1 !px-2 !text-xs sm:!text-sm flex-1 bg-white"
                            placeholder="Belum ada nama"
                          />
                          <button
                            onClick={() => handleUpdateStoreName(link.id)}
                            className="bg-google-text text-white px-2 sm:px-3 py-1 rounded font-bold text-[10px] sm:text-xs hover:bg-gray-800"
                          >
                            SIMPAN
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-3">
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1">LABEL:</label>
                        <div className="flex gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={labelInput[link.id] ?? link.label ?? ''}
                            onChange={(e) => setLabelInput({ ...labelInput, [link.id]: e.target.value })}
                            className="input-field !py-1 !px-2 !text-xs sm:!text-sm flex-1 bg-white border-google-green"
                            placeholder="Kasir"
                          />
                          <button
                            onClick={() => handleUpdateLabel(link.id)}
                            className="bg-google-text text-white px-2 sm:px-3 py-1 rounded font-bold text-[10px] sm:text-xs hover:bg-gray-800"
                          >
                            SIMPAN
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-3">
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1">URL MAPS:</label>
                        <div className="flex gap-1 sm:gap-2">
                          <input
                            type="url"
                            value={urlGmbInput[link.id] ?? link.urlGmb ?? ''}
                            onChange={(e) => setUrlGmbInput({ ...urlGmbInput, [link.id]: e.target.value })}
                            className="input-field !py-1 !px-2 !text-xs sm:!text-sm flex-1 bg-white"
                            placeholder="https://maps.app.goo.gl/..."
                          />
                          <button
                            onClick={() => handleUpdateUrlGmb(link.id)}
                            className="bg-google-text text-white px-2 sm:px-3 py-1 rounded font-bold text-[10px] sm:text-xs hover:bg-gray-800"
                          >
                            SIMPAN
                          </button>
                        </div>
                        {link.urlGmb && (
                          <div className="mt-1">
                            <a href={link.urlGmb} target="_blank" className="text-[9px] sm:text-[10px] text-google-blue font-bold hover:underline">Tes &rarr;</a>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-2 sm:p-4 align-top">
                      <div className="mb-2">
                        {link.isSuspended ? (
                          <span className="inline-block bg-google-red/20 text-google-red border-2 border-google-red font-bold px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">SUSPEND</span>
                        ) : link.expiredAt && toDate(link.expiredAt) <= new Date() ? (
                          <span className="inline-block bg-google-yellow/20 text-google-yellow border-2 border-google-yellow font-bold px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">EXPIRED</span>
                        ) : link.isClaimed ? (
                          <span className="inline-block bg-google-green/20 text-google-green border-2 border-google-green font-bold px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">AKTIF</span>
                        ) : (
                          <span className="inline-block bg-gray-200 text-gray-500 border-2 border-gray-300 font-bold px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">BELUM</span>
                        )}
                      </div>

                      <div className="text-[10px] sm:text-xs font-bold text-gray-600 mt-2 sm:mt-3">
                        Berakhir:<br />
                        {link.expiredAt ? (
                          <span className={toDate(link.expiredAt) <= new Date() ? 'text-google-red' : 'text-google-blue'}>
                            {toDate(link.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-gray-400">Selamanya</span>
                        )}
                      </div>
                    </td>

                    <td className="p-2 sm:p-4 align-top">
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="bg-gray-100 p-2 rounded border border-gray-200">
                          <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 block mb-1">MASA BERLAKU:</label>
                          <div className="flex gap-1 sm:gap-2">
                            <input
                              type="datetime-local"
                              value={expiryInput[link.id] ?? (link.expiredAt ? new Date(toDate(link.expiredAt).getTime() - toDate(link.expiredAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')}
                              onChange={(e) => setExpiryInput({ ...expiryInput, [link.id]: e.target.value })}
                              className="input-field !py-1 !px-2 !text-[10px] sm:!text-xs flex-1 bg-white"
                            />
                            <button
                              onClick={() => handleUpdateExpiry(link.id)}
                              className="bg-google-blue text-white px-2 py-1 rounded font-bold text-[9px] sm:text-[10px] hover:bg-blue-600"
                            >
                              SET
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleSuspend(link.id)}
                          className={`w-full text-white font-bold py-2 rounded text-[10px] sm:text-xs border-2 transition-colors shadow-google-sm ${
                            link.isSuspended
                              ? 'bg-google-green border-google-green hover:bg-green-600'
                              : 'bg-google-red border-google-red hover:bg-red-700'
                          }`}
                        >
                          {link.isSuspended ? 'BUKA' : 'SUSPEND'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 bg-white text-xs sm:text-sm font-bold"
            >
              Prev
            </button>
            <span className="text-gray-600 text-xs sm:text-sm font-bold">Hal {page}/{totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 bg-white text-xs sm:text-sm font-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
