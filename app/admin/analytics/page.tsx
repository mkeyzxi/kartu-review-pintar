'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AnalyticsData } from '@/types/scan-log';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { trackError } from '@/lib/utils/error-tracking';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      if (day) params.append('day', day);

      // Cookie session dikirim browser secara otomatis
      const response = await fetch(`/api/admin/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Gagal memuat analytics');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
      trackError(err as Error, { context: 'fetch_analytics' });
    } finally {
      setLoading(false);
    }
  }, [year, month, day]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = {
    labels: data?.chartLabels || [],
    datasets: [
      {
        label: 'Total Scan',
        data: data?.chartData || [],
        backgroundColor: '#4285F4',
        borderColor: '#111827',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: '#3367d6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: '#f3f4f6',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
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
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setRetryCount(prev => prev + 1);
                fetchAnalytics();
              }}
              className="btn-google-blue"
            >
              COBA LAGI {retryCount > 0 && `(${retryCount})`}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 hover:bg-gray-300 text-google-text font-bold px-4 py-2 rounded-lg border-2 border-gray-400 transition-all text-sm"
            >
              RELOAD HALAMAN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold-display text-google-text">ANALYTICS</h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Ringkasan penggunaan kartu dan traffic redirect.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/admin/dashboard"
            className="flex-1 sm:flex-initial bg-gray-200 hover:bg-gray-300 text-google-text font-bold-display px-3 sm:px-4 py-2 rounded-lg border-2 border-google-text shadow-[4px_4px_0px_rgba(17,24,39,0.1)] transition-all text-sm sm:text-base text-center"
          >
            KEMBALI
          </Link>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card-solid p-4 sm:p-6 flex flex-col border-google-blue shadow-[4px_4px_0px_#4285F4] sm:shadow-[8px_8px_0px_#4285F4]">
          <span className="text-xs sm:text-sm text-google-blue font-bold mb-1 sm:mb-2">TOTAL SCAN</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{(data?.totalScans || 0).toLocaleString('id-ID')}</span>
        </div>
        <div className="card-solid p-4 sm:p-6 flex flex-col border-google-green shadow-[4px_4px_0px_#34A853] sm:shadow-[8px_8px_0px_#34A853]">
          <span className="text-xs sm:text-sm text-google-green font-bold mb-1 sm:mb-2">HARI INI</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{(data?.todayScans || 0).toLocaleString('id-ID')}</span>
        </div>
        <div className="card-solid p-4 sm:p-6 flex flex-col border-google-yellow shadow-[4px_4px_0px_#FBBC05] sm:shadow-[8px_8px_0px_#FBBC05]">
          <span className="text-xs sm:text-sm text-google-yellow font-bold mb-1 sm:mb-2">BULAN INI</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold-display text-google-text">{(data?.monthScans || 0).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="card-solid p-4 sm:p-6 bg-white mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-3 sm:mb-4">FILTER WAKTU</h2>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">TAHUN</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input-field cursor-pointer text-sm"
              >
                <option value="">Semua Tahun</option>
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">BULAN</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="input-field cursor-pointer text-sm"
              >
                <option value="">Semua Bulan</option>
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">HARI TANGGAL</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="input-field cursor-pointer text-sm"
              >
                <option value="">Semua Hari</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {(year || month || day) && (
            <div className="flex justify-end">
              <button
                onClick={() => { setYear(''); setMonth(''); setDay(''); }}
                className="bg-gray-200 hover:bg-gray-300 text-google-text font-bold px-4 sm:px-6 py-2 sm:py-[14px] rounded-lg border-2 border-gray-400 flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Grafik Penggunaan */}
        <div className="card-solid p-4 sm:p-6 bg-white">
          <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-4 sm:mb-6">SCAN 7 HARI TERAKHIR</h2>
          <div className="relative h-48 sm:h-64 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-google-blue"></div>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Statistik Kartu */}
        <div className="card-solid p-4 sm:p-6 bg-white">
          <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-4 sm:mb-6">KARTU TERAKTIF</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-2 sm:pb-3 text-xs sm:text-sm font-bold text-gray-500">LABEL / LOKASI</th>
                  <th className="pb-2 sm:pb-3 text-xs sm:text-sm font-bold text-gray-500">KODE</th>
                  <th className="pb-2 sm:pb-3 text-xs sm:text-sm font-bold text-gray-500 text-right">SCAN</th>
                </tr>
              </thead>
              <tbody>
                {data?.topCards.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500 text-xs sm:text-sm">Belum ada data scan.</td>
                  </tr>
                ) : (
                  data?.topCards.map((card) => (
                    <tr key={card.linkId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 font-bold text-google-text text-xs sm:text-sm">
                        {card.storeName || 'Tanpa Label'}
                      </td>
                      <td className="py-2 sm:py-3">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[10px] sm:text-xs border border-gray-300">
                          {card.linkSlug}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 text-right font-bold-display text-google-blue text-xs sm:text-sm">
                        {card.totalScan.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Aktivitas */}
      <div className="card-solid p-4 sm:p-6 bg-white">
        <h2 className="text-lg sm:text-xl font-bold-display text-google-text mb-4 sm:mb-6">AKTIVITAS TERBARU</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-gray-500">WAKTU</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-gray-500">KARTU</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-gray-500">DEVICE & BROWSER</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-gray-500">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentScans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 sm:p-6 text-center text-gray-500 font-bold text-xs sm:text-sm">Belum ada aktivitas.</td>
                </tr>
              ) : (
                data?.recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-gray-700">
                      {toDate(scan.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).replace(/\//g, '/')}
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="font-bold text-xs sm:text-sm">{scan.storeName || 'Tanpa Label'}</div>
                      <div className="font-mono text-[10px] sm:text-xs text-gray-500">{scan.linkSlug}</div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold capitalize">{scan.deviceType || 'Unknown'}</span>
                        {' - '}
                        {scan.browser || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      {scan.status === 'valid' ? (
                        <span className="inline-block bg-google-green/20 text-google-green font-bold px-2 py-1 rounded text-[9px] sm:text-[10px] border border-google-green">VALID</span>
                      ) : (
                        <span className="inline-block bg-google-yellow/20 text-google-yellow font-bold px-2 py-1 rounded text-[9px] sm:text-[10px] border border-google-yellow">{scan.status.toUpperCase()}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
