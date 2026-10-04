import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { updateLink } from '@/lib/firestore/links';
import { updateLabelSchema } from '@/lib/utils/validation';
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
    
    const body = await request.json();
    const validation = updateLabelSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    await updateLink(params.id, { label: validation.data.label });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Label kartu berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
