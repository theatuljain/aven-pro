"use client";

import { useLayoutEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { api, useReady } from "@/lib/store";
import type { PublicRegistration } from "@/lib/types";
import { isPhone } from "@/lib/utils";
import { NotAvailable, PageHeader } from "../Cards";
import { Field } from "../Field";
import { PaymentPanel } from "./PaymentPanel";

export function StatusView() {
  const t = useT();
  const ready = useReady();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ registration: PublicRegistration; phone: string; key: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Personal details are cleared when the visitor leaves the page.
  useLayoutEffect(() => () => { setResult(null); setId(""); setPhone(""); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!id.trim() || !isPhone(phone)) return setError(t("Enter the reference or UTR number and the mobile number."));
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const registration = await api<PublicRegistration>("/api/status", "POST", { registrationId: id, phone });
      setResult({ registration, phone, key: Date.now() });
    } catch (e) {
      setError(t((e as Error).message));
    }
    setBusy(false);
  }

  return (
    <>
      <PageHeader title="Check Status" subtitle="See your registration and payment status" />
      <div className="container-page py-10">
        {!ready ? <NotAvailable ready={false} /> : (
          <div className="mx-auto max-w-3xl space-y-6">
            <form noValidate onSubmit={submit} className="card space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("Reference number or UTR number *")} hint={t("Use the REG number, or the 12-digit UTR of your payment.")}><input className="input uppercase" placeholder="REG-XXXXXXXX" value={id} onChange={(e) => setId(e.target.value)} /></Field>
                <Field label={t("Mobile number *")} hint={t("For a team, use the leader's number.")}><input className="input" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} /></Field>
              </div>
              {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}
              <button type="submit" disabled={busy} className="btn-primary w-full">{t(busy ? "Please wait…" : "Check Status")}</button>
            </form>
            {result && <PaymentPanel key={result.key} registration={result.registration} phone={result.phone} />}
          </div>
        )}
      </div>
    </>
  );
}
