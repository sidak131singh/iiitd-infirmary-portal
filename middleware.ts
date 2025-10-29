import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Add cache control headers for auth-related pages
    const response = NextResponse.next()
    
    if (pathname.startsWith("/login") || pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/student")) {
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    // Handle logout redirect
    if (pathname === "/api/auth/signout") {
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
      return response
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login and auth routes without authentication
        const { pathname } = req.nextUrl
        
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/unauthorized") ||
          pathname === "/"
        ) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
