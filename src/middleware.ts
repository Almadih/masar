import { NextResponse, type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  try {
    const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!session?.user) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('auth_required', 'true');
      loginUrl.searchParams.set('redirect', '/admin');
      return NextResponse.redirect(loginUrl);
    }

    if (!isUserAdmin(session.user)) {
      const unauthorizedUrl = new URL('/', request.url);
      unauthorizedUrl.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth check error:', error);
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth_required', 'true');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
