'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Link as LinkType } from '@/types/link';
import QRCode from 'qrcode';

interface ActivationFormProps {
  link: LinkType;
}

export default function ActivationForm({ link }: ActivationFormProps) {
  const [formData, setFormData] = useState({
    url_gmb: '',
    store_name: '',
    phone_number: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/links/${link.slug}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  // Generate QR code setelah aktivasi berhasil
  useEffect(() => {
    if (success && link.slug) {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/${link.slug}`;
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [success, link.slug]);

  if (success) {
    return (
      <div className="w-full max-w-sm px-4 sm:px-0 animate-fade-up text-center" style={{ animationDelay: '0.1s' }}>
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-google-green" style={{ animationDuration: '2s' }}></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-google-green border-4 border-white shadow-[0_10px_40px_rgba(52,168,83,0.4)]">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-solid p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold-display text-google-text mb-2">KARTU AKTIF!</h1>
          <p className="text-gray-500 font-bold text-xs sm:text-sm mb-2">
            Kartu Review Pintar Anda siap digunakan.
          </p>
          
          {link.storeName && (
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm font-bold-display text-google-blue bg-google-blue/10 border-2 border-google-blue inline-block px-2 sm:px-3 py-1 rounded-full shadow-[2px_2px_0px_#4285F4]">
              {link.storeName.toUpperCase()}
            </p>
          )}

          <div className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 bg-gray-50 border-2 border-gray-100">
            <p className="text-xs sm:text-sm font-bold-display text-google-text">QR CODE LINK ANDA</p>
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md border border-gray-200">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeUrl} alt="QR Code" width={140} height={140} className="sm:w-[160px] sm:h-[160px]" />
              ) : (
                <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] flex items-center justify-center text-gray-400 text-xs sm:text-sm font-bold">
                  Memuat QR...
                </div>
              )}
            </div>
            
            <div className="w-full mt-2">
              <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 p-1">
                <input
                  type="text"
                  id="smart-link"
                  value={`${process.env.NEXT_PUBLIC_APP_URL}/${link.slug}`}
                  readOnly
                  className="bg-transparent text-xs sm:text-sm font-mono text-gray-700 font-bold px-2 w-full outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/${link.slug}`);
                    const toast = document.getElementById('copy-toast');
                    if (toast) {
                      toast.style.opacity = '1';
                      setTimeout(() => { toast.style.opacity = '0'; }, 2000);
                    }
                  }}
                  className="bg-google-blue hover:bg-blue-600 text-white p-2 rounded-md transition-colors flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
              <p id="copy-toast" className="text-[9px] sm:text-[10px] font-bold text-google-green mt-1 opacity-0 transition-opacity">LINK BERHASIL DISALIN!</p>
            </div>
          </div>

          <div className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 bg-google-blue/10 border-2 border-google-blue text-left">
            <p className="text-xs sm:text-sm font-bold-display text-google-blue mb-1">LANGKAH SELANJUTNYA</p>
            <p className="text-[10px] sm:text-xs font-bold text-gray-700 leading-relaxed">
              Scan ulang kartu NFC atau QR Code Anda. Pelanggan akan langsung diarahkan ke halaman ulasan Google Maps bisnis Anda.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/${link.slug}/edit`}
              className="btn-google-blue bg-white !text-google-blue hover:bg-gray-50 border-google-blue shadow-none text-xs sm:text-base"
            >
              EDIT LINK DI KEMUDIAN HARI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg md:max-w-2xl px-4 sm:px-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="card-solid p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 bg-google-blue border-2 border-google-text shadow-[4px_4px_0px_#111827]">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold-display text-google-text mb-1">AKTIVASI</h1>
          <p className="text-xs sm:text-sm font-bold text-gray-500">ID: <span className="font-mono text-google-blue">{link.slug.toUpperCase()}</span></p>
          {link.storeName && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-bold-display text-google-green bg-google-green/10 border-2 border-google-green inline-block px-2 sm:px-3 py-1 rounded-full shadow-[2px_2px_0px_#34A853]">
              {link.storeName.toUpperCase()}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 sm:mb-5 flex items-start gap-2 sm:gap-3 rounded-xl p-3 sm:p-4 bg-google-red/10 border-2 border-google-red text-google-red font-bold">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 bg-google-yellow/10 border-2 border-google-yellow">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-google-yellow text-white shadow-[2px_2px_0px_#111827] border border-google-text">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold-display text-google-text mb-2 tracking-wide">CARA MENDAPATKAN LINK GOOGLE MAPS</p>
              <ol className="text-[10px] sm:text-xs text-gray-700 font-medium space-y-1.5 sm:space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                  Buka aplikasi Google Maps
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                  Cari nama bisnis Anda
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                  Klik tombol Bagikan (Share)
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center mt-0.5">4</span>
                  Pilih Salin Tautan dan tempel di bawah
                </li>
              </ol>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold-display text-google-text mb-2">
                NAMA TOKO / BISNIS <span className="text-gray-400 font-sans font-normal text-[10px] sm:text-xs normal-case">(Opsional)</span>
              </label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="input-field text-sm"
                placeholder="Contoh: Kopi Kenangan"
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold-display text-google-text mb-2">
                NOMOR TELEPON (WA)
              </label>
              <input
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="input-field text-sm"
                placeholder="Contoh: 081234567890"
                autoComplete="tel"
              />
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 font-medium">Berguna jika kami perlu menghubungi Anda.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold-display text-google-text mb-2">
              LINK GOOGLE MAPS BISNIS ANDA
            </label>
            <input
              type="url"
              required
              value={formData.url_gmb}
              onChange={(e) => setFormData({ ...formData, url_gmb: e.target.value })}
              className="input-field text-sm"
              placeholder="https://maps.app.goo.gl/..."
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold-display text-google-text mb-2">
              BUAT PIN KARTU (4-6 DIGIT)
            </label>
            <input
              type="password"
              required
              minLength={4}
              maxLength={6}
              pattern="\d{4,6}"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="input-field text-sm"
              placeholder="Contoh: 123456"
            />
            <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 font-medium">PIN digunakan untuk mengedit link di kemudian hari.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-google-blue text-sm sm:text-base"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>MENGAKTIFKAN...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AKTIFKAN SEKARANG</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-100 text-center">
          <p className="text-xs sm:text-sm text-gray-500 font-bold mb-2">Sudah punya kartu aktif?</p>
          <Link
            href={`/${link.slug}/edit`}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold-display text-google-blue hover:text-blue-700 transition-colors"
          >
            EDIT / PERBARUI LINK &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}


