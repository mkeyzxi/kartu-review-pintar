import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// API routes that must be reachable WITHOUT a cookie (they create / verify the cookie)
const AUTH_PUBLIC_API = [
  '/api/admin/auth/session',
  '/api/admin/auth/check',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  const { pathname } = request.nextUrl;

  // Always allow auth-helper endpoints (they don't need a cookie yet)
  if (AUTH_PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow access to login page
  if (pathname === '/admin/login') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    if (!token) {
      if (pathname.startsWith('/admin/')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
