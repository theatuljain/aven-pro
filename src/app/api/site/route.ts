import { connection } from "next/server";
import { readSite } from "@/lib/server/db";
import { serverError } from "@/lib/server/http";

/** Public website data. It never includes registrations. */
export async function GET() {
  await connection(); // always read the database at request time
  try {
    return Response.json(await readSite(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}
