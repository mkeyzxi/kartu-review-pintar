import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

/**
 * POST /api/admin/auth/session
 *
 * Sets the admin-token cookie server-side so Next.js middleware
 * can read it on subsequent requests.
 *
 * Body: { email: string }
 *
 * This is a lightweight session endpoint for the Firestore-only
 * auth flow (no Firebase Admin SDK required). The token stored in
 * the cookie is a base64 of the email — replace with a proper JWT
 * or Firebase session cookie in production.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // The login page has already verified the Firestore credentials,
    // so we trust the email here and just issue the cookie.
    const tokenValue = Buffer.from(email.trim()).toString('base64');
    const maxAgeSec = 60 * 60 * 24 * 5; // 5 days

    const response = NextResponse.json({ success: true, message: 'Sesi berhasil dibuat' });

    response.cookies.set('admin-token', tokenValue, {
      maxAge: maxAgeSec,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Gagal membuat sesi' },
      { status: 500 }
    );
  }
}
