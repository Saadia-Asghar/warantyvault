import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "wv_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function getRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await getRole(request);

  if (pathname.startsWith("/shop") && pathname !== "/shop/auth") {
    if (role !== "shop") {
      return NextResponse.redirect(new URL("/shop/auth", request.url));
    }
  }

  if (pathname.startsWith("/buyer") && pathname !== "/buyer/auth") {
    if (role !== "buyer") {
      return NextResponse.redirect(new URL("/buyer/auth", request.url));
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/auth") {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/auth", request.url));
    }
  }

  if (pathname.startsWith("/company") && pathname !== "/company/auth") {
    if (role !== "company") {
      return NextResponse.redirect(new URL("/company/auth", request.url));
    }
  }

  /* Nearby map is for buyers and anonymous visitors — not shop/brand/admin workflows */
  if (pathname === "/nearby" && role && role !== "buyer") {
    const dest =
      role === "shop" ? "/shop" : role === "company" ? "/company" : "/admin";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/:path*", "/buyer/:path*", "/admin/:path*", "/company/:path*", "/nearby"],
};
