import { NextResponse } from 'next/server'

export default function middleware(req) {
  const url = req.nextUrl.clone()

  if (url.pathname === '/widget') {
    // Check if the cookies exist in the request
    const sessionToken = req.cookies.get('__Secure-next-auth.session-token')
    const callbackUrl = req.cookies.get('__Secure-next-auth.callback-url')
    const csrfToken = req.cookies.get('__Host-next-auth.csrf-token')

    // Create a response object
    const response = NextResponse.next()

    // Remove session cookies for the /widget route if they exist
    if (sessionToken) {
      response.cookies.delete('__Secure-next-auth.session-token')
    }
    if (callbackUrl) {
      response.cookies.delete('__Secure-next-auth.callback-url')
    }
    if (csrfToken) {
      response.cookies.delete('__Host-next-auth.csrf-token')
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/widget'],
}
