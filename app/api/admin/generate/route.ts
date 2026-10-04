import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { createLink, getLinkBySlug } from '@/lib/firestore/links';
import { generateUniqueSlugs } from '@/lib/utils/slug';
import { generateSchema } from '@/lib/utils/validation';
import { ApiResponse, GenerateResponse } from '@/types/api';

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
    
    const { count, store_name } = validation.data;
    
    // Generate unique slugs
    const slugs = generateUniqueSlugs(count);
    
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
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.json<GenerateResponse>({
      status: 'success',
      generated: createdLinks.length,
      slugs: createdLinks.map((l) => l.slug),
      links: createdLinks.map((l) => `${baseUrl}/${l.slug}`),
      message: `${createdLinks.length} kartu baru berhasil di-generate. Siap cetak!`,
    });
  } catch (error) {
    console.error('Error generating cards:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
