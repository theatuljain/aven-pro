/** Server only. This prototype accepts Razorpay TEST keys and refuses live keys. */
export function razorpayTestKeys() {
  const id = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  return id.startsWith("rzp_test_") && secret ? { id, secret } : null;
}

export const NOT_CONFIGURED = "Razorpay test keys are not set up yet.";
