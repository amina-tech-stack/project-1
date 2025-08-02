/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isPublicRoute = pathname === "/login" || pathname === "/signup";
  const isDashboardRoute = pathname === "/dashboard";
  const isTokenValid = (token: string | undefined): boolean => {
    if (!token) {
      return false;
    }
    try {
      verify(token, process.env.JWT_SECRET || "");
      return true;
    } catch (error) {
      console.log("Token verification failed:", error);
      return false;
    }
  };
  if (isPublicRoute && isTokenValid(token)) {
    console.log("Authorized user redirected to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isDashboardRoute && isTokenValid(token)) {
    console.log("Authorized user accessing dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
// Apply middleware to specific routes
export const config = {
  matcher: ["/login", "/signup", "/dashboard"],
};
