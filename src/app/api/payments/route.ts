import { Binary, MongoServerError } from "mongodb";
import { registrations, screenshots } from "@/lib/server/db";
import { clientIp, fail, readJson, serverError, withinLimit } from "@/lib/server/http";
import { publicRegistration } from "@/lib/server/public";
import { isUtr } from "@/lib/upi";

const MAX_IMAGE_BYTES = 600_000;

/** A visitor submits the UTR number and screenshot of a UPI payment. */
export async function POST(request: Request) {
  const body = (await readJson(request, 900_000)) as Record<string, unknown> | null;
  if (!body) return fail("The screenshot is too large. Choose a smaller picture.", 400);
  const id = String(body.registrationId ?? "").trim().toUpperCase();
  const phone = String(body.phone ?? "").trim();
  const utr = String(body.utr ?? "").trim();
  if (!isUtr(utr)) return fail("Enter the 12-digit UTR number.", 400);

  const encoded = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.screenshot ?? ""))?.[1];
  const image = encoded ? Buffer.from(encoded, "base64") : null;
  const isJpeg = !!image && image.length > 100 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  if (!image || !isJpeg || image.length > MAX_IMAGE_BYTES) return fail("Add the payment screenshot.", 400);

  try {
    if (!(await withinLimit(`payment:${clientIp(request)}`, 60, 60))) return fail("Too many attempts. Try again later.", 429);
    const collection = await registrations();
    // The mobile number must match, so nobody else can submit for this registration.
    const registration = await collection.findOne({ id, phone });
    if (!registration) return fail("No registration found with this reference number and mobile number.", 404);
    if (registration.paymentStatus === "Submitted" || registration.paymentStatus === "Approved") {
      return fail("Payment details were already submitted for this registration.", 409);
    }
    if (await collection.findOne({ utr })) return fail("This UTR number has already been used.", 409);

    await (await screenshots()).replaceOne({ _id: id }, { data: new Binary(image), uploadedAt: new Date() }, { upsert: true });
    const updated = await collection.findOneAndUpdate(
      { id, phone, paymentStatus: { $in: ["Pending", "Rejected"] } },
      { $set: { paymentStatus: "Submitted", utr, submittedAt: new Date().toISOString() }, $unset: { rejectReason: "" } },
      { returnDocument: "after" },
    );
    if (!updated) return fail("Payment details were already submitted for this registration.", 409);
    return Response.json(publicRegistration(updated));
  } catch (error) {
    // The unique index stops two people from using one UTR at the same moment.
    if (error instanceof MongoServerError && error.code === 11000) return fail("This UTR number has already been used.", 409);
    return serverError(error);
  }
}
