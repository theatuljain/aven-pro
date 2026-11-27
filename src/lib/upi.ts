export const isUpiId = (value: string) => /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/.test(value.trim());

/** A UPI UTR (bank reference number) has 12 digits. */
export const isUtr = (value: string) => /^\d{12}$/.test(value);

/** Opens a UPI app with the receiver, amount and registration number filled in. */
export function upiLink({ upiId, payeeName, amount, reference }: { upiId: string; payeeName: string; amount: number; reference: string }) {
  const query = [
    `pa=${encodeURIComponent(upiId).replace("%40", "@")}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `am=${amount.toFixed(2)}`,
    "cu=INR",
    `tn=${encodeURIComponent(reference)}`,
  ].join("&");
  return `upi://pay?${query}`;
}
