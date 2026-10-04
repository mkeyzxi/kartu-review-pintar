'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link as LinkType } from '@/types/link';

interface EditFormProps {
  link: LinkType;
}

export default function EditForm({ link }: EditFormProps) {
  const [step, setStep] = useState<'verify' | 'edit'>('verify');
  const [pin, setPin] = useState('');
  const [urlGmb, setUrlGmb] = useState(link.urlGmb || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/links/${link.slug}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'PIN salah');
        setLoading(false);
        return;
      }

      setStep('edit');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/links/${link.slug}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, url_gmb: urlGmb }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Terjadi kesalahan');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold-display text-google-text mb-2">BERHASIL!</h1>
          <p className="text-gray-500 font-medium">URL Google Maps berhasil diperbarui.</p>
        </div>

        <div className="card-solid p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-green border-2 border-google-text shadow-[4px_4px_0px_#111827]">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-6">Perubahan telah disimpan.</p>
            <Link
              href={`/${link.slug}`}
              className="btn-google-blue"
            >
              KEMBALI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold-display text-google-text mb-2">VERIFIKASI</h1>
          <p className="text-gray-500 font-medium">Masukkan PIN untuk mengedit link Anda.</p>
          {link.storeName && (
            <p className="mt-3 text-sm font-bold-display text-google-green bg-google-green/10 border-2 border-google-green inline-block px-3 py-1 rounded-full shadow-[2px_2px_0px_#34A853]">
              {link.storeName.toUpperCase()}
            </p>
          )}
        </div>

        <div className="card-solid p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl p-4 bg-google-red/10 border-2 border-google-red text-google-red font-bold">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold-display text-google-text mb-2">PIN KARTU</label>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-field"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-google-blue"
            >
              {loading ? 'MEMVERIFIKASIKAN...' : (
                <>
                  LANJUTKAN
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-gray-100 text-center">
            <Link href={`/${link.slug}`} className="text-sm font-bold-display text-gray-400 hover:text-gray-600">
              &larr; KEMBALI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold-display text-google-text mb-2">EDIT LINK</h1>
        <p className="text-gray-500 font-medium">Perbarui tujuan link kartu Anda.</p>
        {link.storeName && (
          <p className="mt-3 text-sm font-bold-display text-google-green bg-google-green/10 border-2 border-google-green inline-block px-3 py-1 rounded-full shadow-[2px_2px_0px_#34A853]">
            {link.storeName.toUpperCase()}
          </p>
        )}
      </div>

      <div className="card-solid p-8">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl p-4 bg-google-red/10 border-2 border-google-red text-google-red font-bold">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdateUrl} className="space-y-6">
          <input type="hidden" name="pin" value={pin} />
          
          <div>
            <label className="block text-sm font-bold-display text-google-text mb-2">LINK GOOGLE MAPS BARU</label>
            <input
              type="url"
              required
              value={urlGmb}
              onChange={(e) => setUrlGmb(e.target.value)}
              className="input-field"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-google-blue"
          >
            {loading ? 'MENYIMPAN...' : (
              <>
                SIMPAN PERUBAHAN
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
