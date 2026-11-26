import { NOT_CONFIGURED, razorpayTestKeys } from "@/lib/razorpay-server";

export async function POST(request: Request) {
  const keys = razorpayTestKeys();
  if (!keys) return Response.json({ error: NOT_CONFIGURED }, { status: 503 });

  // Prototype: the amount comes from the browser because prices are stored there.
  // With a database, look up the price on the server instead.
  const body = await request.json().catch(() => null);
  const amount = Math.round(Number(body?.amount) * 100); // paise
  const receipt = String(body?.receipt ?? "").slice(0, 40);
  if (!Number.isFinite(amount) || amount < 100 || amount > 50_000_000 || !receipt) {
    return Response.json({ error: "Invalid payment amount." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keys.id}:${keys.secret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency: "INR", receipt }),
    });
    const order = await response.json();
    if (!response.ok) {
      const error = order?.error?.description ?? "Razorpay could not create the order.";
      return Response.json({ error }, { status: 502 });
    }
    return Response.json({ keyId: keys.id, orderId: order.id, amount: order.amount });
  } catch {
    return Response.json({ error: "Could not reach Razorpay. Check the internet connection." }, { status: 502 });
  }
}
