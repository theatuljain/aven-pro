"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { updateData } from "@/lib/store";
import type { Registration } from "@/lib/types";
import { money } from "@/lib/utils";

interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: object) => {
      open: () => void;
      on: (event: "payment.failed", handler: (r: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Could not load Razorpay. Check the internet connection."));
    };
    document.body.appendChild(script);
  });
}

async function post(url: string, data: object) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "Payment request failed.");
  return result;
}

export function RazorpayButton({ registration: r, onPaid }: { registration: Registration; onPaid: (paymentId: string) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function verify(result: RazorpayResult) {
    try {
      await post("/api/razorpay/verify", result);
      const paymentId = result.razorpay_payment_id;
      updateData((d) => ({
        ...d,
        registrations: d.registrations.map((x) => (x.id === r.id ? { ...x, paymentStatus: "Test payment verified", paymentId } : x)),
      }));
      onPaid(paymentId);
    } catch {
      setMessage("The payment could not be verified, so the status is still Pending.");
    }
    setBusy(false);
  }

  async function pay() {
    setBusy(true);
    setMessage("");
    try {
      const order = await post("/api/razorpay/order", { amount: r.amount, receipt: r.id });
      await loadCheckout();
      const checkout = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: "AvenPro (test mode)",
        description: `${r.competitionName} registration`,
        prefill: { name: r.participantName, contact: r.phone, email: r.email },
        theme: { color: "#14602c" },
        handler: verify,
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", (response) => setMessage(response.error?.description ?? "Payment failed. Try again."));
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not start.");
      setBusy(false);
    }
  }

  return (
    <div className="text-center">
      <button type="button" className="btn-green" disabled={busy || r.amount < 1} onClick={pay}>
        {busy ? t("Please wait…") : t("Pay {amount} with Razorpay (test)", { amount: money(r.amount) })}
      </button>
      <p className="mt-2 text-xs text-zinc-500">{t("Test mode: no real money is charged.")}</p>
      {message && <p role="alert" className="mt-3 text-sm font-medium text-accent">{t(message)}</p>}
    </div>
  );
}
