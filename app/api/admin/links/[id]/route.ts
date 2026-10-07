import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { adminGetLinkById, adminUpdateLink } from '@/lib/firestore/admin-links';
import { updateStoreNameSchema, updateUrlGmbSchema } from '@/lib/utils/validation';
import { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
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
      await adminUpdateLink(params.id, { storeName: validation.data.store_name });
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
      await adminUpdateLink(params.id, { urlGmb: validation.data.url_gmb });
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
