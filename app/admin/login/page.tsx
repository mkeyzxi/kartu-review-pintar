'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth) {
      setError('Firebase Auth tidak tersedia. Pastikan konfigurasi Firebase benar.');
      setInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // User already has a Firebase session — verify the server cookie too
          try {
            const res = await fetch('/api/admin/auth/check', { method: 'GET' });
            if (res.ok) {
              router.replace('/admin/dashboard');
              return;
            }
          } catch {
            // ignore — fall through to show login form
          }
        }
        setInitializing(false);
      },
      (err) => {
        console.error('LoginPage: auth state error', err);
        setError('Terjadi kesalahan saat memuat autentikasi. Silakan refresh halaman.');
        setInitializing(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!auth) {
      setError('Firebase Auth tidak tersedia. Pastikan konfigurasi Firebase benar.');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign in with Firebase Auth
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await credential.user.getIdToken();

      // 2. Ask the API route to verify token and set HttpOnly cookie
      const res = await fetch('/api/admin/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Gagal membuat sesi. Coba lagi.');
      }

      // 3. Hard navigate so the next request carries the fresh cookie
      window.location.href = '/admin/dashboard';
    } catch (err: unknown) {
      console.error('LoginPage: login error', err);
      setError(err instanceof Error ? err.message : 'Login gagal');
      setLoading(false);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #4285F4',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#666' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          background: 'white',
          border: '3px solid #111827',
          boxShadow: '8px 8px 0px rgba(17, 24, 39, 0.1)',
          borderRadius: '16px',
          padding: '32px',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              marginBottom: '16px',
              background: '#4285F4',
              border: '2px solid #111827',
              boxShadow: '4px 4px 0px #111827',
            }}>
              <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Archivo Black, sans-serif', textTransform: 'uppercase', color: '#111827', marginBottom: '4px' }}>
              LOGIN ADMIN
            </h1>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Masuk untuk mengelola kartu</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: '20px', borderRadius: '12px', padding: '16px', background: 'rgba(234, 67, 53, 0.1)', border: '2px solid #EA4335', color: '#EA4335', fontWeight: 'bold' }}>
              <p style={{ fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Archivo Black, sans-serif', textTransform: 'uppercase', color: '#111827', marginBottom: '8px' }}>
                EMAIL
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', background: '#f8f9fa', border: '2px solid #e5e7eb', borderRadius: '8px', color: '#111827', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', outline: 'none' }}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Archivo Black, sans-serif', textTransform: 'uppercase', color: '#111827', marginBottom: '8px' }}>
                PASSWORD
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', background: '#f8f9fa', border: '2px solid #e5e7eb', borderRadius: '8px', color: '#111827', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', outline: 'none' }}
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px 24px', background: '#4285F4', color: 'white', fontFamily: 'Archivo Black, sans-serif', textTransform: 'uppercase', fontSize: '16px', borderRadius: '8px', border: '2px solid #4285F4', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? 'LOGIN...' : 'LOGIN'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '32px', fontSize: '14px', fontWeight: 'bold', color: '#999', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} KARTU REVIEW PINTAR
        </p>
      </div>
    </div>
  );
}
