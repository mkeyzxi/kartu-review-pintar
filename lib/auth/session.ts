import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

/**
 * Edge-safe base64 decode (works in Node.js, Edge runtime, and browser).
 */
function base64Decode(input: string): string {
  try {
    // Node.js runtime
    if (typeof Buffer !== 'undefined' && typeof (Buffer as any).from === 'function') {
      return (Buffer as any).from(input, 'base64').toString('utf-8');
    }
  } catch {
    // fall through to atob
  }
  // Edge runtime / browser fallback
  try {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error('Invalid base64');
  }
}

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
    const decoded = base64Decode(token).trim();
    payload = JSON.parse(decoded);

    if (!payload.email || !payload.uid) {
      throw new Error('Invalid payload');
    }
  } catch {
    // Fallback: try legacy format (plain base64 email)
    try {
      const email = base64Decode(token).trim();
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
