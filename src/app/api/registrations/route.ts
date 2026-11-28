import { randomBytes } from "node:crypto";
import { checkRegistration } from "@/lib/registration";
import { readSite, registrations } from "@/lib/server/db";
import { clientIp, fail, readJson, serverError, withinLimit } from "@/lib/server/http";
import { publicRegistration } from "@/lib/server/public";
import type { Registration, RegistrationInput } from "@/lib/types";

/** The team name or participant name, so one parent's mobile can still enter several children. */
const entryName = (r: Pick<Registration, "type" | "teamName" | "participantName">) =>
  (r.type === "group" ? r.teamName : r.participantName).replace(/\s+/g, " ").trim().toLowerCase();

export async function POST(request: Request) {
  const input = (await readJson(request, 60_000)) as Partial<RegistrationInput> | null;
  if (!input) return fail("Invalid registration details.", 400);
  try {
    // Generous, because a school may register many people from one connection.
    if (!(await withinLimit(`register:${clientIp(request)}`, 100, 60))) {
      return fail("Too many registrations from this connection. Try again later.", 429);
    }
    const { competitions } = await readSite();
    const result = checkRegistration(input, competitions.find((c) => c.slug === input.competitionSlug));
    if ("error" in result) return fail(result.error, 400);
    const collection = await registrations();
    // Unpaid and rejected entries do not block, so an unfinished form can be filled again.
    const { phone, competitionSlug, type } = result.data;
    const paid = await collection
      .find({ phone, competitionSlug, type, paymentStatus: { $in: ["Submitted", "Approved"] } })
      .toArray();
    if (paid.some((r) => entryName(r) === entryName(result.data))) {
      return fail("This entry is already registered with this mobile number. Use Check Status to see it.", 409);
    }
    const registration: Registration = {
      ...result.data,
      id: `REG-${randomBytes(6).toString("hex").toUpperCase()}`,
      paymentStatus: "Pending",
      createdAt: new Date().toISOString(),
    };
    await collection.insertOne({ ...registration });
    return Response.json(publicRegistration(registration), { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
