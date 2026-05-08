import { type NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Check for session cookie
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)
  const isAuthenticated = !!session?.userId

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname === '/'

  // 2. Redirect logic
  if (isPublicPath) {
    // If user is logged in and tries to access login page, redirect to dashboard
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Allow access to public paths
    return NextResponse.next()
  }

  // 3. Protected routes logic (everything else)
  if (!isAuthenticated) {
    // If not logged in, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Specific checks for dashboard
  if (pathname.startsWith('/dashboard')) {
    const universityId = request.cookies.get('university_id')?.value
    
    // If no university cookie and not super admin, redirect to login
    if (!universityId && session.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
