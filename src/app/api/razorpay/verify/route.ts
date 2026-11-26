import { createHmac, timingSafeEqual } from "node:crypto";
import { NOT_CONFIGURED, razorpayTestKeys } from "@/lib/razorpay-server";

export async function POST(request: Request) {
  const keys = razorpayTestKeys();
  if (!keys) return Response.json({ error: NOT_CONFIGURED }, { status: 503 });

  const body = await request.json().catch(() => null);
  const orderId = String(body?.razorpay_order_id ?? "");
  const paymentId = String(body?.razorpay_payment_id ?? "");
  const expected = createHmac("sha256", keys.secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(String(body?.razorpay_signature ?? ""), "hex");
  const verified = !!orderId && !!paymentId && received.length === expected.length && timingSafeEqual(received, expected);

  return Response.json({ verified }, { status: verified ? 200 : 400 });
}
