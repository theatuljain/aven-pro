import { isAdmin } from "@/lib/server/auth";
import { registrations, screenshots } from "@/lib/server/db";
import { fail, serverError } from "@/lib/server/http";

/** Deletes an unfinished or rejected registration. Paid entries are kept as records. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return fail("Please sign in.", 401);
  const { id } = await params;
  try {
    // The status is part of the filter, so a proof sent a moment ago is not lost.
    const result = await (await registrations()).deleteOne({ id, paymentStatus: { $in: ["Pending", "Rejected"] } });
    if (!result.deletedCount) return fail("This registration changed. Refresh the list and try again.", 409);
    await (await screenshots()).deleteOne({ _id: id });
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
