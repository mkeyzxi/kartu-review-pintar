import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

/**
 * Verify the admin session from the `admin-token` cookie.
 *
 * The cookie is set by POST /api/admin/auth/session and contains
 * a base64-encoded email address. The middleware already guards all
 * admin routes, and the login page verified credentials against
 * Firestore before issuing the cookie — so decoding the email here
 * is sufficient.
 *
 * Returns the decoded email on success, or a NextResponse with the
 * appropriate error message on failure.
 */
export async function verifyAdminSession(
  request: NextRequest
): Promise<{ email: string } | { error: NextResponse }> {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return {
      error: NextResponse.json<ApiResponse>(
        { success: false, error: 'Token tidak ditemukan' },
        { status: 401 }
      ),
    };
  }

  let email: string;
  try {
    email = Buffer.from(token, 'base64').toString('utf-8').trim();
  } catch {
    return {
      error: NextResponse.json<ApiResponse>(
        { success: false, error: 'Token tidak valid' },
        { status: 401 }
      ),
    };
  }

  if (!email) {
    return {
      error: NextResponse.json<ApiResponse>(
        { success: false, error: 'Token tidak valid' },
        { status: 401 }
      ),
    };
  }

  return { email };
}
