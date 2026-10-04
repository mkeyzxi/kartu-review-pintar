'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AdminLayout: checking authentication via API');

    // Cookie is HttpOnly — cannot read via document.cookie.
    // Use the check endpoint instead; the browser sends cookies automatically.
    fetch('/api/admin/auth/check', { method: 'GET' })
      .then((res) => {
        if (res.ok) {
          console.log('AdminLayout: authenticated');
          setAuthenticated(true);
        } else {
          console.log('AdminLayout: not authenticated, redirecting to login');
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      })
      .catch(() => {
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      })
      .finally(() => setLoading(false));
  }, [router, pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-google-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    if (pathname === '/admin/login') {
      return <>{children}</>;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
