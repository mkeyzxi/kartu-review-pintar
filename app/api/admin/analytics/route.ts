import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAnalyticsData } from '@/lib/firestore/scan-logs';
import { ApiResponse } from '@/types/api';
import { AnalyticsData } from '@/types/scan-log';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const day = searchParams.get('day') ? parseInt(searchParams.get('day')!) : undefined;
    
    const analyticsData = await getAnalyticsData({ year, month, day });
    
    return NextResponse.json<ApiResponse<AnalyticsData>>({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
