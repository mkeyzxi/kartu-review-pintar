import { NextRequest, NextResponse } from 'next/server';
import { getLinkBySlug } from '@/lib/firestore/links';
import { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const link = await getLinkBySlug(params.slug);
    
    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Link tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error('Error getting link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
