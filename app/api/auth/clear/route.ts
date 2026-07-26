import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Hapus semua cookie yang terkait Supabase auth
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
  ];

  cookieNames.forEach((name) => {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  });

  return response;
}
