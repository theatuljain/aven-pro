import { connection } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { registrations } from "@/lib/server/db";
import { fail, serverError } from "@/lib/server/http";

export async function GET(request: Request) {
  await connection();
  if (!isAdmin(request)) return fail("Please sign in.", 401);
  try {
    const list = await (await registrations())
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(5000)
      .toArray();
    return Response.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}
