"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import type { Competition } from "@/lib/types";
import { competitionPath, money } from "@/lib/utils";
import { Picture } from "./Media";

export function PageHeader({ title, subtitle, crumbs = [] }: { title: string; subtitle?: string; crumbs?: { href: string; label: string }[] }) {
  const t = useT();
  return (
    <div className="stadium py-12 text-white">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap gap-2 text-xs text-white/75">
          <Link href="/" className="hover:text-gold">{t("Home")}</Link>
          {crumbs.map((c) => (
            <span key={c.href} className="flex gap-2">
              <span>›</span>
              <Link href={c.href} className="hover:text-gold">{t(c.label)}</Link>
            </span>
          ))}
        </nav>
        <h1 className="font-display text-5xl font-extrabold italic sm:text-6xl">{t(title)}</h1>
        {subtitle && <p className="mt-1 text-white/80">{t(subtitle)}</p>}
      </div>
    </div>
  );
}

export function CompetitionGrid({ items }: { items: Competition[] }) {
  const t = useT();
  if (!items.length) return <p className="card p-8 text-center text-zinc-500">{t("No competitions are open here right now.")}</p>;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <li key={c.slug} className="card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
          <Link href={competitionPath(c)} tabIndex={-1} aria-hidden>
            <Picture id={c.image} alt={t(c.name)} icon={c.icon} tone={c.type} className="h-44 w-full" />
          </Link>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="font-display text-2xl font-semibold text-brand">{t(c.name)}</h2>
            <p className="mt-1 flex-1 text-sm text-zinc-600">{t(c.summary)}</p>
            <p className="mt-3 text-sm font-semibold text-accent">{t("Winning prize {amount}", { amount: money(c.prize) })}</p>
            <Link href={competitionPath(c)} className="btn-green mt-4">{t("View Details")}</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotAvailable({ ready }: { ready: boolean }) {
  const t = useT();
  if (!ready) return <p className="container-page py-24 text-center text-zinc-500">{t("Loading…")}</p>;
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-brand">{t("Not available")}</h1>
      <p className="mt-2 mb-6 text-zinc-600">{t("This page does not exist or the competition is currently closed.")}</p>
      <Link href="/" className="btn-green">{t("Back to Home")}</Link>
    </div>
  );
}
