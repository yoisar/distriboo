import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/productos"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // Si ya está logueado y va a /login, redirigir a dashboard
    if (pathname === "/login") {
      const token = request.cookies.get("distriboo_auth");
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
