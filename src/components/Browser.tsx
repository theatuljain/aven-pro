"use client";

import { useState } from "react";
import { hi } from "@/lib/hi";
import { useT } from "@/lib/i18n";
import { AGE_CATEGORIES } from "@/lib/seed";
import type { Competition } from "@/lib/types";
import { CompetitionGrid } from "./Cards";

/**
 * Search and age filter above a list of competitions. When `children` is given,
 * it is shown until the visitor starts filtering.
 */
export function CompetitionBrowser({ items, children }: { items: Competition[]; children?: React.ReactNode }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("");
  const search = query.trim().toLowerCase();
  const filtering = !!search || !!age;
  // Names match in either language.
  const matches = items.filter((c) =>
    (!age || c.ageCategories.includes(age)) && `${c.name} ${hi[c.name] ?? ""}`.toLowerCase().includes(search));

  return (
    <>
      <div role="search" className="card mb-8 grid gap-4 p-5 sm:grid-cols-[1fr_14rem]">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t("Search competitions")}</span>
          <input type="search" className="input" placeholder={t("Search by name, for example Cricket")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t("Your age")}</span>
          <select className="input" value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">{t("All ages")}</option>
            {AGE_CATEGORIES.map((a) => <option key={a.id} value={a.id}>{t("{range} years", { range: a.id.replace("-", "–") })}</option>)}
          </select>
        </label>
        {filtering && (
          <p role="status" className="text-sm text-zinc-600 sm:col-span-2">
            {t("{count} found", { count: matches.length })}{" "}
            <button type="button" className="ml-2 cursor-pointer font-semibold text-accent underline" onClick={() => { setQuery(""); setAge(""); }}>{t("Clear search")}</button>
          </p>
        )}
      </div>
      {!filtering && children ? children : filtering && !matches.length
        ? <p className="card p-8 text-center text-zinc-500">{t("No competition matches your search. Try another name or age.")}</p>
        : <CompetitionGrid items={matches} />}
    </>
  );
}
