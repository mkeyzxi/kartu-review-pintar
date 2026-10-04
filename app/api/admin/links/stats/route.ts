import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getLinksCount } from '@/lib/firestore/links';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    const stats = await getLinksCount();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
