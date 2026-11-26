"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import { useData } from "@/lib/store";
import type { Registration } from "@/lib/types";
import { money } from "@/lib/utils";
import { Picture } from "../Media";
import { RazorpayButton } from "./RazorpayButton";

/** Razorpay runs in test mode only. UPI QR is still a placeholder. */
export function PaymentPanel({ registration: r }: { registration: Registration }) {
  const t = useT();
  const { payment } = useData().content;
  const methods = [
    { id: "razorpay", label: "Razorpay", on: payment.razorpayEnabled },
    { id: "upi", label: "UPI QR Code", on: payment.upiEnabled },
  ].filter((m) => m.on);
  const [method, setMethod] = useState(methods[0]?.id ?? "");
  const [paymentId, setPaymentId] = useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-brand bg-brand-light p-6 text-center">
        <p className="font-display text-2xl font-semibold text-brand">{t("Registration details saved")}</p>
        <p className="mt-1 text-sm">{t("Reference: {id} for {name}", { id: r.id, name: t(r.competitionName) })}</p>
        <p className="mt-3 font-display text-4xl font-bold">{money(r.amount)}</p>
        {r.type === "group" && <p className="text-sm">{t("{count} members, {share} each", { count: r.members.length, share: money(r.amount / r.members.length) })}</p>}
      </div>
      {!paymentId && (
        <div className="card p-6">
          <h2 className="font-semibold">{t("Select payment method")}</h2>
          {!methods.length && <p className="mt-2 text-sm text-zinc-600">{t("Online payment is not available yet.")}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            {methods.map((m) => (
              <button key={m.id} type="button" aria-pressed={method === m.id} onClick={() => setMethod(m.id)} className={method === m.id ? "btn-green" : "btn-outline"}>{t(m.label)}</button>
            ))}
          </div>
          {method === "upi" && (
            <div className="mt-5">
              {payment.qrImage ? (
                <Picture id={payment.qrImage} alt="UPI QR code" className="mx-auto size-56 rounded-xl" />
              ) : (
                <div className="mx-auto flex size-56 items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 text-sm text-zinc-500">{t("QR code placeholder")}</div>
              )}
            </div>
          )}
          {method === "razorpay" && (
            <div className="mt-5">
              <RazorpayButton registration={r} onPaid={setPaymentId} />
            </div>
          )}
        </div>
      )}
      <div role="status" className={`rounded-2xl p-5 text-sm ${paymentId ? "bg-brand-light" : "bg-amber-50"}`}>
        {paymentId ? (
          <><strong>{t("Payment status: Test payment verified.")}</strong> {t("Payment ID {id}. This was a test, so no real money was charged.", { id: paymentId })}</>
        ) : (
          <><strong>{t("Payment status: Pending.")}</strong> {t("The organisers will share payment instructions.")}</>
        )}
      </div>
      <Link href="/" className="btn-outline w-full">{t("Back to Home")}</Link>
    </div>
  );
}
