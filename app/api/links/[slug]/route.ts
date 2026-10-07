import { NextRequest, NextResponse } from 'next/server';
import { adminGetLinkBySlug } from '@/lib/firestore/admin-links';
import { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Serialize Admin Timestamp class instances ke ISO string agar aman di JSON. */
function serializeLink(link: any) {
  const out: any = { ...link };
  for (const key of ['createdAt', 'updatedAt', 'expiredAt'] as const) {
    const v = out[key];
    if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      try {
        out[key] = v.toDate().toISOString();
      } catch {
        out[key] = null;
      }
    }
  }
  return out;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const link = await adminGetLinkBySlug(params.slug);

    if (!link) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Link tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: serializeLink(link),
    });
  } catch (error) {
    console.error('Error getting link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
