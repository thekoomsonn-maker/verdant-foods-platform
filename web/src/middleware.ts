import { NextResponse, type NextRequest } from "next/server";
import { authSecret, readSession, safeNext, SESSION_COOKIE } from "@/lib/session";

/**
 * Access control (Edge runtime).
 *  /admin/*      Verdant staff only            → otherwise /team?next=…
 *  /b2b/*        staff or business accounts    → otherwise /b2b/sign-in?next=…
 *  /team, /b2b/sign-in   already signed in     → straight to the console / portal
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const role = await readSession(req.cookies.get(SESSION_COOKIE)?.value, authSecret());
  const here = pathname + search;

  const go = (to: string) => noIndex(NextResponse.redirect(new URL(to, req.url)));

  if (pathname === "/team") {
    return role === "staff" ? go(safeNext(req.nextUrl.searchParams.get("next"), "/admin")) : noIndex(NextResponse.next());
  }
  if (pathname === "/b2b/sign-in") {
    return role ? go(safeNext(req.nextUrl.searchParams.get("next"), "/b2b")) : noIndex(NextResponse.next());
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (role !== "staff") return go(`/team?next=${encodeURIComponent(here)}`);
  } else if (pathname === "/b2b" || pathname.startsWith("/b2b/")) {
    if (!role) return go(`/b2b/sign-in?next=${encodeURIComponent(here)}`);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  return noIndex(res);
}

function noIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*", "/b2b", "/b2b/:path*", "/team"] };
