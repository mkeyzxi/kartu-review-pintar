import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/auth/check
 *
 * Returns 200 if the admin-token cookie is present (middleware
 * already guards this route), or 401 otherwise.
 *
 * Used by the login page's onAuthStateChanged callback to detect
 * whether the server cookie is valid before redirecting.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Tidak terautentikasi' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
