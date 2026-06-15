import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isPatient = token?.roles?.includes("user");
    const isTherapist = token?.roles?.includes("therapist");
    const isAdmin = token?.roles?.includes("admin");

    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/terapeuta") && !isTherapist) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/pacjent") && !isPatient) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/terapeuta/:path*", "/user/:path*"],
};
