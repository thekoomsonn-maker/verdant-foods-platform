/**
 * Signed session cookie for the staff console (/admin) and the business portal (/b2b).
 * Web Crypto only, so the same code runs in middleware (Edge) and in Route Handlers (Node).
 *
 * Cookie value: `role.expiry.signature`
 *   role       "staff" | "business"
 *   expiry     unix seconds
 *   signature  base64url(HMAC-SHA256(`role.expiry`, AUTH_SECRET))
 */
export const SESSION_COOKIE = "vf_session";
export const ROLES = ["staff", "business"] as const;
export type Role = (typeof ROLES)[number];

export const HOURS_12 = 12 * 60 * 60;
export const DAYS_30 = 30 * 24 * 60 * 60;

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Constant-time comparison of two equal-length strings. */
function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Constant-time comparison of any two strings: both are hashed first, so length does not leak. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  return sameString(b64url(ha), b64url(hb));
}

export function authSecret(): string | undefined {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 16 ? s : undefined;
}

export async function createSession(role: Role, maxAgeSeconds: number, secret: string): Promise<string> {
  const payload = `${role}.${Math.floor(Date.now() / 1000) + maxAgeSeconds}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

/** Returns the role if the token is well formed, unexpired and signed with `secret`; otherwise null. */
export async function readSession(token: string | undefined, secret: string | undefined): Promise<Role | null> {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, exp, sig] = parts;
  if (!(ROLES as readonly string[]).includes(role)) return null;
  const expiry = Number(exp);
  if (!Number.isFinite(expiry) || expiry * 1000 <= Date.now()) return null;
  const expected = await hmac(`${role}.${exp}`, secret);
  return sameString(sig, expected) ? (role as Role) : null;
}

/** Only allow same-site relative paths as a post sign-in destination. */
export function safeNext(next: unknown, fallback: string): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
