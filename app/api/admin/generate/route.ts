import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { createLink, getLinkBySlug } from '@/lib/firestore/links';
import { generateUniqueSlugs } from '@/lib/utils/slug';
import { generateSchema } from '@/lib/utils/validation';
import { ApiResponse, GenerateResponse } from '@/types/api';
import { clearAnalyticsCache } from '@/lib/firestore/scan-logs';
import { trackError } from '@/lib/utils/error-tracking';

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request);
    if ('error' in session) {
      return session.error;
    }
    
    // Validate input
    const body = await request.json();
    const validation = generateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { count, store_name, custom_slugs } = validation.data;
    
    let slugs: string[] = [];
    
    // Jika ada custom slugs, validasi dan gunakan
    if (custom_slugs && custom_slugs.length > 0) {
      // Cek duplikasi di dalam array sendiri
      const uniqueSlugs = Array.from(new Set(custom_slugs));
      if (uniqueSlugs.length !== custom_slugs.length) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Tidak boleh ada slug duplikat dalam satu request' },
          { status: 400 }
        );
      }
      
      // Cek apakah slug sudah digunakan
      for (const slug of uniqueSlugs) {
        const existing = await getLinkBySlug(slug);
        if (existing) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: `Slug "${slug}" sudah digunakan. Silakan pilih slug lain.` },
            { status: 400 }
          );
        }
      }
      
      slugs = uniqueSlugs;
    } else {
      // Generate random slugs
      slugs = generateUniqueSlugs(count);
    }
    
    // Create links
    const createdLinks = [];
    for (const slug of slugs) {
      const link = await createLink({
        slug,
        storeName: store_name || null,
        isClaimed: false,
        isSuspended: false,
      });
      createdLinks.push(link);
    }
    
    // Clear analytics cache karena ada data baru
    clearAnalyticsCache();
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.json<GenerateResponse & { success: boolean }>({
      success: true,
      status: 'success',
      generated: createdLinks.length,
      slugs: createdLinks.map((l) => l.slug),
      links: createdLinks.map((l) => `${baseUrl}/${l.slug}`),
      message: `${createdLinks.length} kartu baru berhasil di-generate. Siap cetak!`,
    });
  } catch (error) {
    console.error('Error generating cards:', error);
    trackError(error as Error, { context: 'generate_cards' });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
