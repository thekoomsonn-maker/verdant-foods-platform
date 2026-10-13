import { NextResponse } from "next/server";
import { authSecret, createSession, DAYS_30, HOURS_12, safeEqual, safeNext, SESSION_COOKIE, type Role } from "@/lib/session";

export const dynamic = "force-dynamic";

type Body = { email?: unknown; password?: unknown; area?: unknown; remember?: unknown; next?: unknown };

const AREAS = {
  team: { role: "staff" as Role, home: "/admin", pw: "TEAM_PASSWORD", off: "Team sign-in is not set up yet. Ask an administrator to add TEAM_PASSWORD and AUTH_SECRET." },
  business: { role: "business" as Role, home: "/b2b", pw: "BUSINESS_PASSWORD", off: "Business sign-in is not set up yet. Please contact Verdant to get access." },
};

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return fail("Something went wrong. Please try again.", 400); }

  const area = body.area === "team" || body.area === "business" ? AREAS[body.area] : null;
  if (!area) return fail("Unknown sign-in area.", 400);

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter your work email, like name@company.com.", 400);
  if (!password) return fail("Enter your password.", 400);

  const secret = authSecret();
  const expected = process.env[area.pw];
  if (!secret || !expected) return fail(area.off, 503);

  // Always compare the password, even when the email is not on the list, so timing does not reveal which emails exist.
  const pwOk = await safeEqual(password, expected);
  let emailOk = true;
  if (area.role === "staff") {
    const allowed = (process.env.TEAM_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    emailOk = allowed.length === 0 || allowed.includes(email);
  }
  if (!pwOk || !emailOk) {
    await new Promise((r) => setTimeout(r, 350));
    return fail("That email and password do not match.", 401);
  }

  const maxAge = body.remember === true ? DAYS_30 : HOURS_12;
  const res = NextResponse.json({ ok: true, next: safeNext(body.next, area.home) });
  res.cookies.set(SESSION_COOKIE, await createSession(area.role, maxAge, secret), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
