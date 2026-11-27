import { connection } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { registrations, screenshots } from "@/lib/server/db";
import { fail, readJson, serverError } from "@/lib/server/http";

type Context = { params: Promise<{ id: string }> };

/** The payment screenshot, for the signed-in admin only. */
export async function GET(request: Request, { params }: Context) {
  await connection();
  if (!isAdmin(request)) return fail("Please sign in.", 401);
  try {
    const shot = await (await screenshots()).findOne({ _id: (await params).id });
    if (!shot) return fail("No screenshot found.", 404);
    return new Response(new Uint8Array(shot.data.buffer), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    return serverError(error);
  }
}

/** Approve or reject a payment after checking it in the bank or UPI app. */
export async function PATCH(request: Request, { params }: Context) {
  if (!isAdmin(request)) return fail("Please sign in.", 401);
  const body = (await readJson(request, 2_000)) as { action?: unknown; reason?: unknown } | null;
  const { id } = await params;
  const reason = String(body?.reason ?? "").trim().slice(0, 200);
  try {
    const collection = await registrations();
    let matched = 0;
    if (body?.action === "approve") {
      const result = await collection.updateOne(
        { id, paymentStatus: "Submitted" },
        { $set: { paymentStatus: "Approved", reviewedAt: new Date().toISOString() } },
      );
      matched = result.matchedCount;
    } else if (body?.action === "reject") {
      if (!reason) return fail("Write the reason for rejecting.", 400);
      const current = await collection.findOne({ id, paymentStatus: { $in: ["Submitted", "Approved"] } });
      if (current) {
        // The UTR is released, so its real owner can still use it.
        const result = await collection.updateOne(
          { id, utr: current.utr },
          {
            $set: { paymentStatus: "Rejected", rejectReason: reason, rejectedUtr: current.utr, reviewedAt: new Date().toISOString() },
            $unset: { utr: "" },
          },
        );
        matched = result.matchedCount;
      }
    } else {
      return fail("Unknown action.", 400);
    }
    if (!matched) return fail("This payment changed. Refresh the list and try again.", 409);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
