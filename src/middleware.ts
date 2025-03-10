import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get response headers
  const requestHeaders = new Headers(request.headers);
  
  // Add the host information to headers
  requestHeaders.set('x-hostname', request.headers.get('host') || '');
  requestHeaders.set('x-protocol', request.headers.get('x-forwarded-proto') || 'https');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 