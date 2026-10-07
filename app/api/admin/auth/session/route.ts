import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { getAdminAuth } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/auth/session
 *
 * Verifies the Firebase ID token from the request body and sets
 * an HttpOnly cookie with the user's email for middleware to read.
 *
 * Body: { idToken: string, email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, email: clientEmail } = body as { idToken?: string; email?: string };

    if (!idToken || !clientEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Kredensial tidak lengkap' },
        { status: 400 }
      );
    }

    // Verify the ID token using Firebase Admin SDK
    let decodedToken;
    try {
      const auth = getAdminAuth();
      decodedToken = await auth.verifyIdToken(idToken);
      console.log('[session] Token verified successfully for:', decodedToken.email);
    } catch (verifyError: any) {
      console.error('[session] ID token verification failed:', {
        code: verifyError.code,
        message: verifyError.message,
      });

      // Provide more specific error messages
      let errorMessage = 'Token tidak valid atau sudah kedaluwarsa';
      if (verifyError.code === 'auth/argument-error') {
        errorMessage = 'Format token tidak valid';
      } else if (verifyError.code === 'auth/id-token-expired') {
        errorMessage = 'Token sudah kedaluwarsa. Silakan login ulang.';
      } else if (verifyError.code === 'auth/insufficient-permission') {
        errorMessage = 'Izin tidak cukup untuk verifikasi token';
      }

      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage, details: verifyError.message },
        { status: 401 }
      );
    }

    // Use the email from the verified token (not client-supplied)
    const email = decodedToken.email?.toLowerCase().trim();
    const uid = decodedToken.uid;

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email tidak ditemukan dalam token' },
        { status: 400 }
      );
    }

    // Check if user has admin custom claims
    const isAdmin = decodedToken.admin === true;

    // Create cookie value with email and admin status
    const cookiePayload = JSON.stringify({ email, uid, isAdmin });
    const tokenValue = Buffer.from(cookiePayload).toString('base64');
    const maxAgeSec = 60 * 60 * 24 * 5; // 5 days

    const response = NextResponse.json({
      success: true,
      message: 'Sesi berhasil dibuat',
      isAdmin,
    });

    response.cookies.set('admin-token', tokenValue, {
      maxAge: maxAgeSec,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error creating session:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Gagal membuat sesi', details: error.message },
      { status: 500 }
    );
  }
}
