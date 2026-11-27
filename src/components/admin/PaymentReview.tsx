"use client";

/* eslint-disable @next/next/no-img-element -- private screenshot served by the admin API */
import { useState } from "react";
import { api } from "@/lib/store";
import type { Registration } from "@/lib/types";
import { money } from "@/lib/utils";
import { useRegistrations } from "./Shell";

/** Screenshot, UTR and the approve or reject buttons for one registration. */
export function PaymentReview({ r }: { r: Registration }) {
  const { refresh } = useRegistrations();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const source = `/api/admin/payments/${encodeURIComponent(r.id)}`;
  const shot = `${source}?v=${encodeURIComponent(r.submittedAt ?? "")}`;

  async function review(action: "approve" | "reject") {
    if (action === "reject" && !reason.trim()) return setError("Write the reason for rejecting. The participant will see it.");
    if (action === "approve" && !window.confirm(`Have you found UTR ${r.utr} with ${money(r.amount)} in your bank or UPI app?`)) return;
    setBusy(true);
    setError("");
    try {
      await api(source, "PATCH", { action, reason });
      setReason("");
    } catch (e) {
      setError((e as Error).message);
    }
    refresh();
    setBusy(false);
  }

  if (r.paymentStatus === "Pending") return <p className="mt-5 text-sm text-zinc-600">No payment proof has been sent yet.</p>;
  return (
    <div className="mt-5 rounded-xl border border-zinc-200 p-4">
      <h3 className="font-semibold">Payment check</h3>
      {r.paymentStatus === "Rejected" ? (
        <p className="mt-2 text-sm">Rejected{r.rejectedUtr && ` (UTR ${r.rejectedUtr})`}: {r.rejectReason}</p>
      ) : (
        <p className="mt-2 text-sm">Find <strong>UTR {r.utr}</strong> in your bank or UPI app. The amount received must be <strong>{money(r.amount)}</strong>. Do not approve from the screenshot alone.</p>
      )}
      <a href={shot} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
        <img src={shot} alt="Payment screenshot" className="max-h-96 rounded-lg border border-zinc-200" />
        <span className="mt-1 block text-xs text-accent underline">Open full screenshot</span>
      </a>
      {r.paymentStatus !== "Rejected" && (
        <div className="mt-4 space-y-3">
          {r.paymentStatus === "Submitted" && <button type="button" disabled={busy} className="btn-green" onClick={() => review("approve")}>✓ Approve payment</button>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input" aria-label="Reason for rejecting" placeholder="Reason, for example: amount does not match" value={reason} onChange={(e) => setReason(e.target.value)} />
            <button type="button" disabled={busy} className="btn-primary shrink-0" onClick={() => review("reject")}>Reject</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-accent">{error}</p>}
    </div>
  );
}
