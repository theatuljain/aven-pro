"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
import type { Registration } from "@/lib/types";
import { money } from "@/lib/utils";
import { Title } from "./common";

const date = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

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
    ["Payment status", r.paymentStatus],
    ...(r.paymentId ? [["Razorpay test payment ID", r.paymentId]] : []),
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
        {r.members.map((m, i) => <li key={i}>{m.name}, {m.age} years</li>)}
      </ol>
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-brand-light text-xs uppercase text-brand">
            <tr>{["Name / Leader", "Type", "Competition", "Team", "Members", "Age", "Date", "Amount", "Payment", "Action"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
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
                <td className={`p-3 ${r.paymentStatus === "Pending" ? "text-amber-700" : "font-semibold text-brand"}`}>{r.paymentStatus}</td>
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
  const { registrations } = useData();
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const items = registrations.filter((r) =>
    (!type || r.type === type) &&
    [r.participantName, r.phone, r.teamName, r.competitionName, r.id].join(" ").toLowerCase().includes(query));
  return (
    <>
      <Title text="All individual and group registrations">Registrations</Title>
      <div className="mb-4 grid gap-3 sm:grid-cols-[20rem_12rem]">
        <input className="input" aria-label="Search registrations" placeholder="Search name, phone, team, game…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" aria-label="Registration type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>
      </div>
      <RegistrationTable items={items} />
    </>
  );
}
