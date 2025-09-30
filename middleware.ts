import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip session middleware for the revalidate webhook
  if (pathname.startsWith('/api/revalidate')) {
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
