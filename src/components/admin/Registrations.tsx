"use client";

import { useState } from "react";
import type { Registration } from "@/lib/types";
import { money } from "@/lib/utils";
import { Title } from "./common";
import { PaymentReview } from "./PaymentReview";
import { useRegistrations } from "./Shell";

const date = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export const STATUS: Record<Registration["paymentStatus"], string> = {
  Pending: "Not paid",
  Submitted: "To verify",
  Approved: "Approved",
  Rejected: "Rejected",
};

const STATUS_STYLE: Record<Registration["paymentStatus"], string> = {
  Pending: "bg-amber-100 text-amber-800",
  Submitted: "bg-sky-100 text-sky-800",
  Approved: "bg-brand-light text-brand",
  Rejected: "bg-red-100 text-accent",
};

function Badge({ type }: { type: Registration["type"] }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${type === "group" ? "bg-red-100 text-accent" : "bg-brand-light text-brand"}`}>{type === "group" ? "Group" : "Individual"}</span>;
}

function Details({ r, onClose }: { r: Registration; onClose: () => void }) {
  const rows = [
    ["Reference", r.id],
    ["Competition", r.competitionName],
    ...(r.type === "group" ? [["Team name", r.teamName]] : []),
    [r.type === "group" ? "Team leader" : "Participant", r.participantName],
    ["Mobile", r.phone],
    ["Email", r.email || "Not given"],
    ["City", r.city || "Not given"],
    ["Age category", r.ageCategory],
    ...(r.guardianName ? [["Parent / guardian", `${r.guardianName} (${r.guardianPhone})`]] : []),
    ["Amount", money(r.amount)],
    ["Payment status", STATUS[r.paymentStatus]],
    ["UTR number", r.utr ?? "Not submitted"],
    ["Registered on", date(r.createdAt)],
  ];
  return (
    <div className="card mb-6 border-2 border-brand p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">Registration details <Badge type={r.type} /></h2>
        <button type="button" className="btn-outline" onClick={onClose}>Close</button>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs text-zinc-500">{k}</dt><dd className="break-words text-sm font-medium">{v}</dd></div>
        ))}
      </dl>
      <h3 className="mt-5 text-sm font-semibold">Participants ({r.members.length})</h3>
      <ol className="mt-2 grid list-decimal gap-1 pl-5 text-sm sm:grid-cols-2">
        {r.members.map((m, i) => <li key={i}>{m.name}, {m.age} years{m.phone && `, ${m.phone}`}</li>)}
      </ol>
      <PaymentReview key={r.id} r={r} />
    </div>
  );
}

export function RegistrationTable({ items }: { items: Registration[] }) {
  const [openId, setOpenId] = useState("");
  const open = items.find((r) => r.id === openId);
  if (!items.length) return <p className="card p-8 text-center text-zinc-500">No registrations found.</p>;
  return (
    <>
      {open && <Details r={open} onClose={() => setOpenId("")} />}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-brand-light text-xs uppercase text-brand">
            <tr>{["Name / Leader", "Type", "Competition", "Team", "Members", "Age", "Date", "Amount", "UTR", "Payment", "Action"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.participantName}<span className="block text-xs text-zinc-500">{r.phone}</span></td>
                <td className="p-3"><Badge type={r.type} /></td>
                <td className="p-3">{r.competitionName}</td>
                <td className="p-3">{r.teamName || "—"}</td>
                <td className="p-3">{r.members.length}</td>
                <td className="p-3">{r.ageCategory}</td>
                <td className="p-3">{date(r.createdAt)}</td>
                <td className="p-3">{money(r.amount)}</td>
                <td className="p-3 font-mono text-xs">{r.utr ?? "—"}</td>
                <td className="p-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.paymentStatus]}`}>{STATUS[r.paymentStatus]}</span></td>
                <td className="p-3"><button type="button" className="btn-green" onClick={() => { setOpenId(r.id); window.scrollTo({ top: 0 }); }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Registrations() {
  const { registrations, loaded, error, refresh } = useRegistrations();
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("");
  const query = search.trim().toLowerCase();
  const items = registrations.filter((r) =>
    (!type || r.type === type) &&
    (!payment || r.paymentStatus === payment) &&
    [r.participantName, r.phone, r.teamName, r.competitionName, r.id, r.utr ?? "", ...r.members.flatMap((m) => [m.name, m.phone])].join(" ").toLowerCase().includes(query));
  return (
    <>
      <Title text="All individual and group registrations">Registrations</Title>
      <div className="mb-4 grid gap-3 sm:grid-cols-[20rem_12rem_12rem]">
        <input className="input" aria-label="Search registrations" placeholder="Search name, phone, team, UTR…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" aria-label="Registration type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>
        <select className="input" aria-label="Payment status" value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="">All payments</option>
          {Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <button type="button" className="btn-outline mb-4" onClick={refresh}>Refresh list</button>
      {error && <p role="alert" className="mb-3 text-sm text-accent">{error}</p>}
      {loaded ? <RegistrationTable items={items} /> : <p className="text-zinc-500">Loading registrations…</p>}
    </>
  );
}
