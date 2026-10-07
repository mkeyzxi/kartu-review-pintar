import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';

// API routes that must be reachable WITHOUT a cookie (they create / verify the cookie)
const AUTH_PUBLIC_API = [
  '/api/admin/auth/session',
  '/api/admin/auth/check',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth-helper endpoints (they don't need a cookie yet)
  if (AUTH_PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verify the admin session
  const session = await verifyAdminSession(request);

  // If session verification failed, handle the error
  if ('error' in session) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Protect admin routes
    if (pathname.startsWith('/admin/')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  const { email, isAdmin } = session;

  // Allow access to login page
  if (pathname === '/admin/login') {
    if (email) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes - only admin users
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    if (!isAdmin) {
      if (pathname.startsWith('/admin/')) {
        return NextResponse.redirect(new URL('/admin/login?error=not_admin', request.url));
      }
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
