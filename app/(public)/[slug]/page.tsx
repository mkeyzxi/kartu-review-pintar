import { adminGetLinkBySlug } from '@/lib/firestore/admin-links';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { adminCreateScanLog, adminIsDuplicateScan } from '@/lib/firestore/admin-scan-logs';
import { parseUserAgent, hashIp } from '@/lib/utils/device';
import { clearAnalyticsCache } from '@/lib/firestore/admin-analytics';
import ActivationForm from './ActivationForm';
import { Suspense } from 'react';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
    return new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
  }
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
  }
  return null;
}

/**
 * Firestore Admin Timestamp adalah class instance — tidak boleh dilempar
 * langsung ke Client Component ("Only plain objects... can be passed").
 * Serialize ke plain object (ISO string) sebelum render ActivationForm.
 */
function serializeLinkForClient(link: any) {
  return {
    ...link,
    createdAt: toDate(link.createdAt)?.toISOString() ?? null,
    updatedAt: toDate(link.updatedAt)?.toISOString() ?? null,
    expiredAt: link.expiredAt ? (toDate(link.expiredAt)?.toISOString() ?? null) : null,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const link = await adminGetLinkBySlug(params.slug);
  
  if (!link) {
    return {
      title: '404 - Kartu Tidak Ditemukan | Kartu Pintar',
      description: 'Kartu yang Anda cari tidak ditemukan.',
    };
  }

  const title = link.storeName 
    ? `${link.storeName} - Kartu Review Google Maps | Kartu Pintar`
    : `Kartu Review ${link.slug.toUpperCase()} | Kartu Pintar`;
  
  const description = link.storeName
    ? `Aktivasi kartu review Google Maps untuk ${link.storeName}. Berikan review dan bantu bisnis kami berkembang!`
    : 'Aktivasi kartu review Google Maps Anda. Mudah, cepat, dan praktis!';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://kartupintar.my.id/${params.slug}`,
      siteName: 'Kartu Pintar',
      images: ['/logo-kartu-pintar.jpg'],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo-kartu-pintar.jpg'],
    },
    robots: {
      index: link.isSuspended ? false : true,
      follow: true,
    },
  };
}

async function LinkData({ slug }: { slug: string }) {
  const link = await adminGetLinkBySlug(slug);
  
  if (!link) {
    notFound();
  }
  
  // Check if suspended
  if (link.isSuspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card-solid p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 bg-google-red border-2 border-google-text shadow-google-sm">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold-display text-google-text mb-2">KARTU DITANGGUHKAN</h1>
            <p className="text-xs sm:text-sm text-gray-600">Kartu ini telah ditangguhkan. Silakan hubungi administrator untuk informasi lebih lanjut.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if expired
  const expiredDate = toDate(link.expiredAt);
  if (expiredDate && expiredDate <= new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card-solid p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 bg-google-yellow border-2 border-google-text shadow-google-sm">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold-display text-google-text mb-2">KARTU KEDALUWARSA</h1>
            <p className="text-xs sm:text-sm text-gray-600">Kartu ini telah kedaluwarsa. Silakan hubungi administrator untuk informasi lebih lanjut.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Log scan untuk analytics
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    const deviceInfo = parseUserAgent(userAgent);
    const ipHash = hashIp(ip);
    
    // Cek duplikat dalam 10 detik terakhir
    let isDuplicate = false;
    try {
      isDuplicate = await adminIsDuplicateScan(link.id, ipHash);
    } catch (e) {
      console.warn('Gagal mengecek duplikat (mungkin index belum dibuat), lanjut mencatat log.', e);
    }

    await adminCreateScanLog({
      linkId: link.id,
      linkSlug: link.slug,
      ipHash: ipHash,
      userAgent: userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      referrer: referrer,
      status: isDuplicate ? 'duplicate' : 'valid',
    });

    // Clear analytics cache agar data baru langsung terlihat
    clearAnalyticsCache();
  } catch (error) {
    console.error('Error logging scan:', error);
  }

  // If already claimed, redirect to GMB
  if (link.isClaimed && link.urlGmb) {
    redirect(link.urlGmb);
  }

  // Show activation form (link diserialize dulu — lihat serializeLinkForClient)
  return <ActivationForm link={serializeLinkForClient(link)} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-google-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LinkData slug={params.slug} />
    </Suspense>
  );
}
