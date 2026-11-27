/** Server only: shared helpers for API routes. */
import { attempts } from "./db";

export const fail = (error: string, status: number) => Response.json({ error }, { status });

/** Logs the real cause on the server and gives the visitor a safe message. */
export function serverError(error: unknown) {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : error);
  return fail("The server could not reach the database. Please try again.", 500);
}

export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** Counts one use of `key` and reports whether it is still within the limit. */
export async function withinLimit(key: string, limit: number, minutes: number) {
  const collection = await attempts();
  const now = new Date();
  await collection.deleteMany({ expiresAt: { $lte: now } });
  const record = await collection.findOneAndUpdate(
    { _id: key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + minutes * 60_000) } },
    { upsert: true, returnDocument: "after" },
  );
  return (record?.count ?? 1) <= limit;
}
