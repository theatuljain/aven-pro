import { connection } from "next/server";
import { adminConfigured, isAdmin, passwordMatches, sessionCookie } from "@/lib/server/auth";
import { clientIp, fail, readJson, serverError, withinLimit } from "@/lib/server/http";
import { attempts } from "@/lib/server/db";

export async function GET(request: Request) {
  await connection();
  return Response.json({ signedIn: isAdmin(request) }, { headers: { "Cache-Control": "no-store" } });
}

/** Sign in. */
export async function POST(request: Request) {
  if (!adminConfigured()) return fail("Admin password is not set up on the server.", 503);
  const body = (await readJson(request, 2_000)) as { password?: unknown } | null;
  try {
    const key = `login:${clientIp(request)}`;
    if (!(await withinLimit(key, 8, 15))) return fail("Too many attempts. Try again after 15 minutes.", 429);
    if (!passwordMatches(String(body?.password ?? ""))) return fail("Wrong password.", 401);
    await (await attempts()).deleteOne({ _id: key });
    return Response.json({ signedIn: true }, { headers: { "Set-Cookie": sessionCookie(request, true) } });
  } catch (error) {
    return serverError(error);
  }
}

/** Sign out. */
export async function DELETE(request: Request) {
  return Response.json({ signedIn: false }, { headers: { "Set-Cookie": sessionCookie(request, false) } });
}
