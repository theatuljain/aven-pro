"use client";

/* eslint-disable @next/next/no-img-element -- QR code and preview are generated in the browser */
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { compressImage } from "@/lib/image";
import { useT } from "@/lib/i18n";
import { api, useData } from "@/lib/store";
import type { PublicRegistration } from "@/lib/types";
import { isUpiId, isUtr, upiLink } from "@/lib/upi";
import { money } from "@/lib/utils";
import { Field } from "../Field";

function QrCode({ value }: { value: string }) {
  const t = useT();
  const [image, setImage] = useState<{ value: string; url: string }>();
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: 480, margin: 2 })
      .then((url) => active && setImage({ value, url }))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value]);
  return image?.value === value
    ? <img src={image.url} alt={t("UPI QR code")} className="mx-auto size-60 rounded-xl border border-zinc-200" />
    : <div className="mx-auto size-60 rounded-xl bg-zinc-100" />;
}

function ProofForm({ registration: r, phone, onSubmitted }: { registration: PublicRegistration; phone: string; onSubmitted: (r: PublicRegistration) => void }) {
  const t = useT();
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setScreenshot("");
    setError("");
    if (!file) return;
    try {
      setScreenshot(await compressImage(file));
    } catch {
      setError(t("This picture could not be read. Choose a JPG or PNG screenshot."));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isUtr(utr)) return setError(t("Enter the 12-digit UTR number."));
    if (!screenshot) return setError(t("Add the payment screenshot."));
    setBusy(true);
    setError("");
    try {
      onSubmitted(await api<PublicRegistration>("/api/payments", "POST", { registrationId: r.id, phone, utr, screenshot }));
    } catch (e) {
      setError(t((e as Error).message));
    }
    setBusy(false);
  }

  return (
    <form noValidate onSubmit={submit} className="card space-y-4 p-6">
      <h2 className="font-display text-2xl font-semibold text-brand">{t("After paying, send the proof")}</h2>
      <Field label={t("UTR number (12 digits) *")} hint={t("Open the payment in your UPI app. It is shown as UTR or UPI transaction ID.")}>
        <input className="input tracking-widest" inputMode="numeric" maxLength={12} value={utr} onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))} />
      </Field>
      <Field label={t("Payment screenshot *")}>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2 file:font-semibold file:text-white" />
      </Field>
      {screenshot && <img src={screenshot} alt={t("Selected screenshot")} className="max-h-64 rounded-xl border border-zinc-200" />}
      {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{t(busy ? "Please wait…" : "Submit payment proof")}</button>
    </form>
  );
}

/** UPI payment: the admin checks every payment before it is approved. */
export function PaymentPanel({ registration, phone }: { registration: PublicRegistration; phone: string }) {
  const t = useT();
  const { payment } = useData().content;
  const [r, setR] = useState(registration);
  const [copied, setCopied] = useState(false);
  const canPay = (r.paymentStatus === "Pending" || r.paymentStatus === "Rejected") && r.amount > 0;
  const upiReady = isUpiId(payment.upiId);
  const link = upiLink({ upiId: payment.upiId.trim(), payeeName: payment.payeeName, amount: r.amount, reference: r.id });
  const status = {
    Pending: [t("Payment status: Pending."), t("Pay the amount, then send the proof below."), "bg-amber-50"],
    Submitted: [t("Payment status: Under verification."), t("The organisers will check your payment. Use Check Status to see the result."), "bg-sky-50"],
    Approved: [t("Payment status: Approved."), t("Your registration is confirmed."), "bg-brand-light"],
    Rejected: [t("Payment status: Rejected."), t("Reason: {reason}", { reason: r.rejectReason ?? "" }), "bg-red-50"],
  }[r.paymentStatus];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-brand bg-brand-light p-6 text-center">
        <p className="text-sm">{t("Your reference number")}</p>
        <p className="font-display text-3xl font-bold break-all text-brand">{r.id}</p>
        <p className="mt-1 text-xs text-zinc-600">{t("Save this number. You need it to check your status.")}</p>
        <p className="mt-4 text-sm">{t(r.competitionName)}</p>
        <p className="font-display text-5xl font-bold">{money(r.amount)}</p>
        {r.type === "group" && <p className="text-sm">{t("{count} members, {share} each", { count: r.memberCount, share: money(r.amount / r.memberCount) })}</p>}
      </div>

      <div role="status" className={`rounded-2xl p-5 text-sm ${r.amount > 0 ? status[2] : "bg-brand-light"}`}>
        {r.amount > 0 ? <><strong>{status[0]}</strong> {status[1]}{r.utr && <span className="mt-1 block">UTR: {r.utr}</span>}</> : t("No fee is needed for this registration.")}
      </div>

      {canPay && !upiReady && <p className="card p-6 text-sm">{t("Online payment is not available yet.")}</p>}
      {canPay && upiReady && (
        <>
          <div className="card space-y-4 p-6 text-center">
            <h2 className="font-display text-2xl font-semibold text-brand">{t("Pay {amount} by UPI", { amount: money(r.amount) })}</h2>
            <QrCode value={link} />
            <p className="text-sm text-zinc-600">{t("Scan with any UPI app. Check the name and amount before paying.")}</p>
            <p className="text-sm">
              {payment.payeeName}<br />
              <strong className="break-all">{payment.upiId}</strong>{" "}
              <button type="button" className="ml-1 cursor-pointer font-semibold text-accent underline" onClick={() => navigator.clipboard?.writeText(payment.upiId.trim()).then(() => setCopied(true)).catch(() => {})}>
                {t(copied ? "Copied" : "Copy")}
              </button>
            </p>
            <a href={link} className="btn-green w-full sm:hidden">{t("Pay with a UPI app")}</a>
          </div>
          <ProofForm registration={r} phone={phone} onSubmitted={(next) => { setR(next); window.scrollTo({ top: 0 }); }} />
        </>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/status" className="btn-outline">{t("Check Status")}</Link>
        <Link href="/" className="btn-outline">{t("Back to Home")}</Link>
      </div>
    </div>
  );
}
