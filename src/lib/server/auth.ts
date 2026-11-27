/** Server only: password-only admin login with a signed, httpOnly cookie. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "avenpro_admin";
const HOURS = 12;

const password = () => process.env.ADMIN_PASSWORD ?? "";
export const adminConfigured = () => password().length >= 8;

const digest = (value: string) => createHash("sha256").update(value).digest();
export const passwordMatches = (value: string) => adminConfigured() && timingSafeEqual(digest(value), digest(password()));

// Changing the password signs everyone out, because it is part of the signing key.
const sign = (expires: string) =>
  createHmac("sha256", digest(`avenpro-session:${password()}`)).update(expires).digest("hex");

export function sessionCookie(request: Request, signedIn: boolean) {
  const expires = String(Date.now() + HOURS * 3_600_000);
  const value = signedIn ? `${expires}.${sign(expires)}` : "";
  const https = (request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol).startsWith("https");
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${signedIn ? HOURS * 3600 : 0}${https ? "; Secure" : ""}`;
}

export function isAdmin(request: Request) {
  if (!adminConfigured()) return false;
  const value = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1] ?? "";
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return timingSafeEqual(digest(signature), digest(sign(expires)));
}
