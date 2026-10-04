import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    message: 'Logout berhasil',
  });
  
  response.cookies.set('admin-token', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  return response;
}
