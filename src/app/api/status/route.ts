import { registrations } from "@/lib/server/db";
import { clientIp, fail, readJson, serverError, withinLimit } from "@/lib/server/http";
import { publicRegistration } from "@/lib/server/public";

/** Looks up one registration. Both the reference and the mobile number must match. */
export async function POST(request: Request) {
  const body = (await readJson(request, 2_000)) as Record<string, unknown> | null;
  const id = String(body?.registrationId ?? "").trim().toUpperCase();
  const phone = String(body?.phone ?? "").trim();
  if (!id || !phone) return fail("Enter the reference number and mobile number.", 400);
  try {
    if (!(await withinLimit(`status:${clientIp(request)}`, 60, 15))) return fail("Too many attempts. Try again later.", 429);
    const registration = await (await registrations()).findOne({ id, phone });
    if (!registration) return fail("No registration found with this reference number and mobile number.", 404);
    return Response.json(publicRegistration(registration));
  } catch (error) {
    return serverError(error);
  }
}
