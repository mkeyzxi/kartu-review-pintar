import { NextRequest, NextResponse } from 'next/server';
import { createScanLog, isDuplicateScan } from '@/lib/firestore/scan-logs';
import { getLinkBySlug } from '@/lib/firestore/links';
import { parseUserAgent, hashIp } from '@/lib/utils/device';
import { ApiResponse } from '@/types/api';

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

    // Get client info
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Parse device info
    const deviceInfo = parseUserAgent(userAgent);
    const ipHash = hashIp(ip);

    // Check duplicate
    const isDuplicate = await isDuplicateScan(link.id, ipHash);

    // Create scan log
    await createScanLog({
      linkId: link.id,
      linkSlug: link.slug,
      ipHash: ipHash,
      userAgent: userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      referrer: referrer,
      status: isDuplicate ? 'duplicate' : 'valid',
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: isDuplicate ? 'Duplicate scan detected' : 'Scan logged successfully',
    });
  } catch (error) {
    console.error('Error logging scan:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
