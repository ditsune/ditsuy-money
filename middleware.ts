import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // JWT error (issued at future, expired, invalid, dll) → paksa clear session
  // dan redirect ke login supaya user bisa fresh login tanpa loop error.
  const isJwtError =
    error &&
    (error.message?.toLowerCase().includes('jwt') ||
      error.message?.toLowerCase().includes('token') ||
      (error as any)?.status === 401);

  if (isJwtError && isDashboardRoute) {
    const loginUrl = new URL('/login', request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Hapus semua cookie supabase yang corrupt
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
        redirectResponse.cookies.set(cookie.name, '', {
          maxAge: 0,
          path: '/',
        });
      }
    });

    return redirectResponse;
  }

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
