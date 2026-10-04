import { NextRequest, NextResponse } from 'next/server';
import { getLinkBySlug, updateLink } from '@/lib/firestore/links';
import { editVerifySchema, editUpdateSchema } from '@/lib/utils/validation';
import { verifyPin } from '@/lib/utils/hashing';
import { ApiResponse } from '@/types/api';
import { toDate } from '@/lib/utils/date';

export async function POST(
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
    
    // Check if suspended
    if (link.isSuspended) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Kartu ini telah ditangguhkan' },
        { status: 403 }
      );
    }
    
    // Check if expired
    if (link.expiredAt && toDate(link.expiredAt) && toDate(link.expiredAt)! <= new Date()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Kartu ini telah kedaluwarsa' },
        { status: 403 }
      );
    }
    
    // Check if claimed
    if (!link.isClaimed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Kartu ini belum diklaim' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Step 1: Verify PIN only (no url_gmb provided)
    if (!body.url_gmb) {
      const validation = editVerifySchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      
      const isValid = await verifyPin(validation.data.pin, link.pinHash || '');
      
      if (!isValid) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'PIN yang Anda masukkan salah' },
          { status: 401 }
        );
      }
      
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'PIN valid',
      });
    }
    
    // Step 2: Update URL (PIN + url_gmb provided)
    const validation = editUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const isValid = await verifyPin(validation.data.pin, link.pinHash || '');
    
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'PIN yang Anda masukkan salah' },
        { status: 401 }
      );
    }
    
    // Update URL
    await updateLink(link.id, {
      urlGmb: validation.data.url_gmb,
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'URL berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error editing link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
