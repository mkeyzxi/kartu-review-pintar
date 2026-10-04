import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getLinkById, updateLink } from '@/lib/firestore/links';
import { updateStoreNameSchema, updateUrlGmbSchema } from '@/lib/utils/validation';
import { ApiResponse } from '@/types/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    const link = await getLinkById(params.id);
    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Link tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Update store name
    if (body.store_name !== undefined) {
      const validation = updateStoreNameSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      await updateLink(params.id, { storeName: validation.data.store_name });
    }
    
    // Update URL GMB
    if (body.url_gmb !== undefined) {
      const validation = updateUrlGmbSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      await updateLink(params.id, { urlGmb: validation.data.url_gmb });
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Link berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
