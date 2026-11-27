import { isAdmin } from "@/lib/server/auth";
import { sites } from "@/lib/server/db";
import { fail, readJson, serverError } from "@/lib/server/http";
import type { SiteDocument } from "@/lib/types";

const isObject = (value: unknown) => !!value && typeof value === "object" && !Array.isArray(value);

function valid(body: Partial<SiteDocument> | null): body is SiteDocument {
  return (
    !!body &&
    Number.isInteger(body.version) &&
    Array.isArray(body.competitions) &&
    body.competitions.every((c) => isObject(c) && typeof c.slug === "string" && !!c.slug && typeof c.name === "string") &&
    isObject(body.content)
  );
}

/** Saves admin changes, unless someone else saved first. */
export async function PUT(request: Request) {
  if (!isAdmin(request)) return fail("Please sign in.", 401);
  const body = (await readJson(request, 1_000_000)) as Partial<SiteDocument> | null;
  if (!valid(body)) return fail("Invalid website data.", 400);
  try {
    const result = await (await sites()).updateOne(
      { _id: "site", version: body.version },
      { $set: { competitions: body.competitions, content: body.content, version: body.version + 1 } },
    );
    if (!result.matchedCount) return fail("The data changed in another window.", 409);
    return Response.json({ version: body.version + 1, competitions: body.competitions, content: body.content });
  } catch (error) {
    return serverError(error);
  }
}
