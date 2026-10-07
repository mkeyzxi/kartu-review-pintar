import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { adminGetLinks, adminGetLinksCount } from '@/lib/firestore/admin-links';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Link } from '@/types/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Convert Firestore Timestamps to ISO strings for JSON serialization.
 */
function serializeLink(link: Link): Link {
  const serialized: any = { ...link };
  if (serialized.createdAt && typeof serialized.createdAt === 'object' && 'toDate' in serialized.createdAt) {
    serialized.createdAt = (serialized.createdAt as { toDate: () => Date }).toDate().toISOString();
  }
  if (serialized.updatedAt && typeof serialized.updatedAt === 'object' && 'toDate' in serialized.updatedAt) {
    serialized.updatedAt = (serialized.updatedAt as { toDate: () => Date }).toDate().toISOString();
  }
  if (serialized.expiredAt && typeof serialized.expiredAt === 'object' && 'toDate' in serialized.expiredAt) {
    serialized.expiredAt = (serialized.expiredAt as { toDate: () => Date }).toDate().toISOString();
  }
  return serialized as Link;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as 'active' | 'inactive' | 'suspended' | 'expired' | null;

    const result = await adminGetLinks({
      page,
      limit,
      search,
      status: status || undefined,
    });

    // Serialize Timestamps to ISO strings for JSON response
    const serializedLinks = result.links.map(serializeLink);

    return NextResponse.json<ApiResponse<PaginatedResponse<Link>>>({
      success: true,
      data: {
        data: serializedLinks,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting links:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
