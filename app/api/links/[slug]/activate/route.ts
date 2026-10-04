import { NextRequest, NextResponse } from 'next/server';
import { getLinkBySlug, updateLink } from '@/lib/firestore/links';
import { activateSchema } from '@/lib/utils/validation';
import { hashPin } from '@/lib/utils/hashing';
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
    
    // Check if already claimed
    if (link.isClaimed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Kartu ini sudah diklaim' },
        { status: 400 }
      );
    }
    
    // Validate input
    const body = await request.json();
    const validation = activateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Hash PIN
    const pinHash = await hashPin(validation.data.pin);
    
    // Update link
    await updateLink(link.id, {
      urlGmb: validation.data.url_gmb,
      storeName: validation.data.store_name || null,
      phoneNumber: validation.data.phone_number,
      pinHash: pinHash,
      isClaimed: true,
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Kartu berhasil diaktifkan!',
    });
  } catch (error) {
    console.error('Error activating link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
