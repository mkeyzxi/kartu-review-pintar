import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

/**
 * Verify the admin session from the `admin-token` cookie.
 *
 * The cookie is set by POST /api/admin/auth/session and contains
 * a base64-encoded JSON payload: { email, uid, isAdmin }.
 *
 * Returns the decoded session data on success, or a NextResponse with
 * the appropriate error message on failure.
 */
export async function verifyAdminSession(
  request: NextRequest
): Promise<{ email: string; uid: string; isAdmin: boolean } | { error: NextResponse }> {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return {
      error: NextResponse.json<ApiResponse>(
        { success: false, error: 'Token tidak ditemukan' },
        { status: 401 }
      ),
    };
  }

  let payload: { email: string; uid: string; isAdmin: boolean };
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8').trim();
    payload = JSON.parse(decoded);

    if (!payload.email || !payload.uid) {
      throw new Error('Invalid payload');
    }
  } catch {
    // Fallback: try legacy format (plain base64 email)
    try {
      const email = Buffer.from(token, 'base64').toString('utf-8').trim();
      if (email && email.includes('@')) {
        payload = { email, uid: '', isAdmin: false };
      } else {
        throw new Error('Invalid token');
      }
    } catch {
      return {
        error: NextResponse.json<ApiResponse>(
          { success: false, error: 'Token tidak valid' },
          { status: 401 }
        ),
      };
    }
  }

  return {
    email: payload.email,
    uid: payload.uid,
    isAdmin: payload.isAdmin,
  };
}
