import { registrations } from "@/lib/server/db";
import { clientIp, fail, readJson, serverError, withinLimit } from "@/lib/server/http";
import { publicRegistration } from "@/lib/server/public";
import { isUtr } from "@/lib/upi";

/** Looks up one registration by reference or UTR number. The mobile number must match too. */
export async function POST(request: Request) {
  const body = (await readJson(request, 2_000)) as Record<string, unknown> | null;
  const id = String(body?.registrationId ?? "").trim().toUpperCase();
  const phone = String(body?.phone ?? "").trim();
  if (!id || !phone) return fail("Enter the reference or UTR number and the mobile number.", 400);
  try {
    if (!(await withinLimit(`status:${clientIp(request)}`, 60, 15))) return fail("Too many attempts. Try again later.", 429);
    // A rejected payment releases its UTR, so the rejected number is searched as well.
    const filter = isUtr(id) ? { phone, $or: [{ utr: id }, { rejectedUtr: id }] } : { phone, id };
    const registration = await (await registrations()).findOne(filter, { sort: { createdAt: -1 } });
    if (!registration) return fail("No registration found. Check the reference or UTR number and the mobile number.", 404);
    return Response.json(publicRegistration(registration));
  } catch (error) {
    return serverError(error);
  }
}
