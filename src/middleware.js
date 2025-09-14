import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  const protectedPaths = ['/profile', '/wishlist', '/checkout', '/orders']
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!isProtected) {
    return NextResponse.next()
  }
  const session = request.cookies.get('session')?.value
  
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/orders/:path*'
  ]
}
