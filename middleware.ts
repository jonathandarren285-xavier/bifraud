import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If authenticated, allow the request through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /auth/* (sign-in, sign-up, forgot-password, reset-password)
     * - /api/auth/* (NextAuth API routes)
     * - /api/register (registration API)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, /sitemap.xml (static files)
     * - /public/* (public assets)
     */
    "/((?!auth|api/auth|api/register|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
