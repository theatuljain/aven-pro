"use client";

import { useLayoutEffect, useState } from "react";
import { AGE_CATEGORIES, GROUPS, newCompetition } from "@/lib/seed";
import { updateSite, useData } from "@/lib/store";
import type { Competition, CompetitionType, GroupId } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Field } from "../Field";
import { ImagePicker, Title, useSave } from "./common";

function Editor({ initial, onClose }: { initial: Competition; onClose: () => void }) {
  // An empty slug means this is a new competition that has not been saved yet.
  const [c, setC] = useState(initial);
  const [error, setError] = useState("");
  const { save, status, clear } = useSave();
  const set = (change: Partial<Competition>) => { setC({ ...c, ...change }); setError(""); clear(); };

  const text = (key: "name" | "icon" | "summary") => (
    <input className="input" value={c[key]} onChange={(e) => set({ [key]: e.target.value })} />
  );
  const area = (key: "description" | "extraInfo") => (
    <textarea className="input" rows={3} value={c[key]} onChange={(e) => set({ [key]: e.target.value })} />
  );
  const lines = (key: "guidelines" | "rules" | "terms") => (
    <textarea className="input" rows={4} value={c[key].join("\n")} onChange={(e) => set({ [key]: e.target.value.split("\n") })} />
  );
  const check = (key: "enabled" | "allowIndividual" | "allowGroup", label: string) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c[key]} onChange={(e) => set({ [key]: e.target.checked })} />{label}</label>
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!c.name.trim()) return setError("Enter a name.");
    if (!(c.prize >= 0)) return setError("Prize cannot be negative.");
    if (!Number.isInteger(c.minMembers) || !Number.isInteger(c.maxMembers) || c.minMembers < 2 || c.maxMembers < c.minMembers || c.maxMembers > 100) {
      return setError("Team size: minimum at least 2, maximum between the minimum and 100.");
    }
    if (!c.ageCategories.length) return setError("Select at least one age category.");
    let slug = c.slug || slugify(c.name);
    if (!slug) return setError("The name must contain English letters or numbers.");
    const clean = (list: string[]) => list.map((x) => x.trim()).filter(Boolean);
    const ok = await save((d) => {
      // A new competition must not overwrite another with the same name.
      if (!c.slug && d.competitions.some((x) => x.slug === slug)) slug = `${slug}-${Date.now().toString(36)}`;
      // Prices are managed on the Pricing page, so keep their latest values.
      const current = d.competitions.find((x) => x.slug === slug);
      const item: Competition = {
        ...c,
        ...(current ? { individualFee: current.individualFee, groupFee: current.groupFee } : {}),
        slug,
        name: c.name.trim(),
        guidelines: clean(c.guidelines),
        rules: clean(c.rules),
        terms: clean(c.terms),
      };
      return {
        ...d,
        competitions: current ? d.competitions.map((x) => (x.slug === slug ? item : x)) : [...d.competitions, item],
      };
    });
    if (ok) setC({ ...c, slug });
  }

  return (
    <form onSubmit={submit} noValidate className="card mb-6 space-y-4 border-2 border-brand p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{c.slug ? `Edit ${c.name}` : "Add new competition"}</h2>
        <button type="button" className="btn-outline" onClick={onClose}>Close</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *">{text("name")}</Field>
        <Field label="Icon (emoji)">{text("icon")}</Field>
        {c.type === "activity" && (
          <Field label="Group">
            <select className="input" value={c.group} onChange={(e) => set({ group: e.target.value as GroupId })}>
              {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Winning prize (₹)"><input type="number" min={0} className="input" value={c.prize} onChange={(e) => set({ prize: Number(e.target.value) })} /></Field>
        <Field label="Minimum team members"><input type="number" min={2} className="input" value={c.minMembers} onChange={(e) => set({ minMembers: Number(e.target.value) })} /></Field>
        <Field label="Maximum team members"><input type="number" min={2} className="input" value={c.maxMembers} onChange={(e) => set({ maxMembers: Number(e.target.value) })} /></Field>
      </div>
      <ImagePicker label="Card and banner image" value={c.image} onChange={(image) => set({ image })} />
      <Field label="Short description">{text("summary")}</Field>
      <Field label="Full description">{area("description")}</Field>
      <Field label="Participation guidelines" hint="One point per line">{lines("guidelines")}</Field>
      <Field label="Rules and regulations" hint="One point per line">{lines("rules")}</Field>
      <Field label="Terms and conditions" hint="One point per line">{lines("terms")}</Field>
      <Field label="Additional information">{area("extraInfo")}</Field>
      <fieldset className="flex flex-wrap gap-4">
        <legend className="mb-1 text-sm font-medium">Age categories</legend>
        {AGE_CATEGORIES.map((a) => (
          <label key={a.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={c.ageCategories.includes(a.id)} onChange={(e) => set({ ageCategories: e.target.checked ? [...c.ageCategories, a.id] : c.ageCategories.filter((x) => x !== a.id) })} />{a.label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-5">
        {check("enabled", "Show on website")}
        {check("allowIndividual", "Allow individual registration")}
        {check("allowGroup", "Allow group registration")}
      </div>
      {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}
      <div className="flex items-center gap-4"><button type="submit" className="btn-primary">Save</button>{status}</div>
      <p className="text-xs text-zinc-500">Set registration fees on the Pricing page.</p>
    </form>
  );
}

export function CompetitionManager({ type }: { type: CompetitionType }) {
  const { competitions } = useData();
  const [editing, setEditing] = useState<{ item: Competition; key: number } | null>(null);
  // Close the editor on leaving, so it cannot later save outdated values.
  useLayoutEffect(() => () => setEditing(null), []);
  const items = competitions.filter((c) => c.type === type);
  const open = (item: Competition) => { setEditing({ item, key: Date.now() }); window.scrollTo({ top: 0 }); };
  const toggle = async (slug: string, enabled: boolean) => {
    setEditing(null); // an open editor would otherwise save the old visibility
    const error = await updateSite((d) => ({ ...d, competitions: d.competitions.map((c) => (c.slug === slug ? { ...c, enabled } : c)) }));
    if (error) window.alert(error);
  };
  const sections = type === "activity"
    ? GROUPS.map((g) => ({ title: g.name, list: items.filter((c) => c.group === g.id) }))
    : [{ title: "Talent competitions", list: items }];

  return (
    <>
      <Title text="Add, edit, show or hide competitions">{type === "activity" ? "Activities" : "Talent"}</Title>
      <button type="button" className="btn-primary mb-5" onClick={() => open(newCompetition({ type, slug: "", name: "", summary: "", description: "", ...(type === "activity" ? { group: "group-a" as const } : {}) }))}>
        + Add {type === "activity" ? "game" : "talent competition"}
      </button>
      {editing && <Editor key={editing.key} initial={editing.item} onClose={() => setEditing(null)} />}
      {sections.map((section) => (
        <section key={section.title} className="mb-6">
          <h2 className="mb-2 font-semibold">{section.title}</h2>
          <ul className="card divide-y">
            {section.list.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-center gap-3 p-4">
                <span aria-hidden className="text-2xl">{c.icon}</span>
                <span className="flex-1 font-medium">{c.name}</span>
                <span className={`text-xs font-semibold ${c.enabled ? "text-brand" : "text-zinc-400"}`}>{c.enabled ? "● Visible" : "○ Hidden"}</span>
                <button type="button" className="btn-outline" onClick={() => toggle(c.slug, !c.enabled)}>{c.enabled ? "Hide" : "Show"}</button>
                <button type="button" className="btn-green" onClick={() => open(c)}>Edit</button>
              </li>
            ))}
            {!section.list.length && <li className="p-4 text-sm text-zinc-500">Nothing here yet.</li>}
          </ul>
        </section>
      ))}
    </>
  );
}
