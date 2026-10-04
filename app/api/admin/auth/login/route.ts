import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Anda sudah login',
    });
  } catch (error) {
    console.error('Error in login check:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
