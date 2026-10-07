import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/auth/check
 *
 * Returns 200 if the admin-token cookie is present and valid (middleware
 * already guards this route), or 401 otherwise.
 *
 * Used by the login page's onAuthStateChanged callback to detect
 * whether the server cookie is valid before redirecting.
 */
export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request);

  if ('error' in session) {
    return session.error;
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      email: session.email,
      isAdmin: session.isAdmin,
    },
  });
}
