import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // ✅ Allow public receipt view
    if (pathname.startsWith("/dashboard/receipt/view/")) {
      return NextResponse.next();
    }

    // If no token → block
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always return true so we handle logic manually
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};