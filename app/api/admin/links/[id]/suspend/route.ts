import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { adminGetLinkById, adminUpdateLink } from '@/lib/firestore/admin-links';
import { ApiResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    const link = await adminGetLinkById(params.id);
    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Link tidak ditemukan' },
        { status: 404 }
      );
    }
    
    await adminUpdateLink(params.id, { isSuspended: !link.isSuspended });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: link.isSuspended ? 'Kartu diaktifkan kembali' : 'Kartu ditangguhkan',
    });
  } catch (error) {
    console.error('Error toggling suspend:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
