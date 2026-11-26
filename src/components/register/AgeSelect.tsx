"use client";

import { useT } from "@/lib/i18n";

interface AgeRange {
  min: number;
  max: number;
}

/** Offers only the ages inside the chosen category, so a wrong age cannot be entered. */
export function AgeSelect({ range, value, onChange, label, placeholder = "Select age" }: {
  range?: AgeRange;
  value: string;
  onChange: (age: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const t = useT();
  const ages = range ? Array.from({ length: range.max - range.min + 1 }, (_, i) => String(range.min + i)) : [];
  return (
    <select className="input disabled:cursor-not-allowed disabled:bg-zinc-100" aria-label={label} disabled={!range} value={ages.includes(value) ? value : ""} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>{t(range ? placeholder : "Choose category first")}</option>
      {ages.map((age) => <option key={age} value={age}>{t("{age} years", { age })}</option>)}
    </select>
  );
}
