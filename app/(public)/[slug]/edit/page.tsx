import { getLinkBySlug } from '@/lib/firestore/links';
import { notFound } from 'next/navigation';
import EditForm from './EditForm';
import { Suspense } from 'react';
import { Timestamp } from 'firebase/firestore';

interface PageProps {
  params: { slug: string };
}

function toDate(value: string | Timestamp | null): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

async function LinkData({ slug }: { slug: string }) {
  const link = await getLinkBySlug(slug);
  
  if (!link) {
    notFound();
  }
  
  // Check if suspended
  if (link.isSuspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card-solid p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-red border-2 border-google-text shadow-google-sm">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold-display text-google-text mb-2">KARTU DITANGGUHKAN</h1>
            <p className="text-sm text-gray-600">Kartu ini telah ditangguhkan. Silakan hubungi administrator.</p>
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
          <div className="card-solid p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-yellow border-2 border-google-text shadow-google-sm">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold-display text-google-text mb-2">KARTU KEDALUWARSA</h1>
            <p className="text-sm text-gray-600">Kartu ini telah kedaluwarsa. Silakan hubungi administrator.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If not claimed, redirect to activation
  if (!link.isClaimed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card-solid p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-yellow border-2 border-google-text shadow-google-sm">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold-display text-google-text mb-2">KARTU BELUM AKTIF</h1>
            <p className="text-sm text-gray-600 mb-6">Kartu ini belum diaktifkan. Silakan aktifkan terlebih dahulu.</p>
            <a
              href={`/${link.slug}`}
              className="btn-google-blue"
            >
              AKTIFKAN KARTU
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return <EditForm link={link} />;
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
