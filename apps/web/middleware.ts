import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request);

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/cook/", "/logs"];
  
  // Public routes that don't require auth
  const publicRoutes = ["/", "/prep", "/auth/login", "/auth/callback"];

  // Check if the path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(route)
  );

  // If it's a protected route, we need to check auth
  // The updateSession already tries to refresh the session
  // We can check for a specific cookie that Supabase sets
  const supabaseAuthCookie = request.cookies.get("sb-access-token");

  if (isProtectedRoute && !supabaseAuthCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return Response.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};