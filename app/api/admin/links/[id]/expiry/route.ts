import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { adminUpdateLink } from '@/lib/firestore/admin-links';
import { updateExpirySchema } from '@/lib/utils/validation';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    const body = await request.json();
    const validation = updateExpirySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const expiredAt = validation.data.expired_at
      ? Timestamp.fromDate(new Date(validation.data.expired_at))
      : null;
    
    await adminUpdateLink(params.id, { expiredAt });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Masa berlangganan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating expiry:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
