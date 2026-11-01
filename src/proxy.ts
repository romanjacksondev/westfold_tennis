import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/leaderboard', '/api/leaderboard', '/api/home', '/api/health', '/information', '/auth/signin', '/privacy', '/terms'];

// Las fotos se leen sin login (ranking público); subir o borrar sigue exigiendo sesión.
const isPublicPhotoRead = (request: NextRequest) =>
  request.method === 'GET' && /^\/api\/players\/[^/]+\/photo$/.test(request.nextUrl.pathname);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.includes(pathname) || isPublicPhotoRead(request) || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const loginUrl = new URL('/auth/signin', request.url);
  loginUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
