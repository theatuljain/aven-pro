"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
import type { Competition } from "@/lib/types";
import { Title, useSave } from "./common";

const COLUMNS = [
  ["individualFee", "Individual fee (₹)"],
  ["groupFee", "Group fee, whole team (₹)"],
  ["minMembers", "Min members"],
  ["maxMembers", "Max members"],
] as const;

type Key = (typeof COLUMNS)[number][0];

function Row({ c }: { c: Competition }) {
  // Only unsaved edits are kept here; other fields always show the saved value.
  const [draft, setDraft] = useState<Partial<Record<Key, string>>>({});
  const shown = (k: Key) => draft[k] ?? String(c[k]);
  const [error, setError] = useState("");
  const { save, status, clear } = useSave();
  function submit() {
    const values = Object.fromEntries(COLUMNS.map(([k]) => [k, shown(k).trim() === "" ? NaN : Number(shown(k))])) as Record<Key, number>;
    if (!(values.individualFee >= 0 && values.groupFee >= 0)) return setError("Fees must be 0 or more.");
    const { minMembers: min, maxMembers: max } = values;
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 2 || max < min || max > 100) return setError("Check team size (2 to 100).");
    setError("");
    const ok = save((d) => ({ ...d, competitions: d.competitions.map((x) => (x.slug === c.slug ? { ...x, ...values } : x)) }));
    if (ok) setDraft({});
  }
  return (
    <tr className="border-t align-top">
      <th scope="row" className="p-3 text-left font-medium">{c.name}</th>
      {COLUMNS.map(([key, label]) => (
        <td key={key} className="p-2">
          <input type="number" min={0} aria-label={`${c.name}: ${label}`} className="input" value={shown(key)} onChange={(e) => { setDraft({ ...draft, [key]: e.target.value }); setError(""); clear(); }} />
        </td>
      ))}
      <td className="p-2">
        <button type="button" className="btn-green" onClick={submit}>Save</button>
        <span className="block">{error ? <span role="alert" className="text-xs text-accent">{error}</span> : status}</span>
      </td>
    </tr>
  );
}

export function Pricing() {
  const { competitions } = useData();
  return (
    <>
      <Title text="New prices appear on registration forms right after saving">Pricing</Title>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-brand-light text-xs uppercase text-brand">
            <tr>
              <th className="p-3 text-left">Competition</th>
              {COLUMNS.map(([k, label]) => <th key={k} className="p-3 text-left">{label}</th>)}
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>{competitions.map((c) => <Row key={c.slug} c={c} />)}</tbody>
        </table>
      </div>
    </>
  );
}
