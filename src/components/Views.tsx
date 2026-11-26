"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { AGE_CATEGORIES, GROUPS } from "@/lib/seed";
import { useData, useReady } from "@/lib/store";
import type { CompetitionType } from "@/lib/types";
import { money } from "@/lib/utils";
import { CompetitionBrowser } from "./Browser";
import { NotAvailable, PageHeader } from "./Cards";
import { Picture } from "./Media";

export function ActivitiesView() {
  const t = useT();
  const { competitions } = useData();
  return (
    <>
      <PageHeader title="Activities" subtitle="Choose a group to see its games" />
      <div className="container-page py-12">
      <CompetitionBrowser items={competitions.filter((c) => c.type === "activity" && c.enabled)}>
      <ul className="grid gap-6 md:grid-cols-3">
        {GROUPS.map((group) => {
          const games = competitions.filter((c) => c.group === group.id && c.enabled);
          return (
            <li key={group.id}>
              <Link href={`/activities/${group.id}`} className="card flex h-full flex-col border-t-8 border-t-brand p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span aria-hidden className="text-4xl">{games.map((g) => g.icon).join(" ")}</span>
                <h2 className="mt-4 font-display text-3xl font-bold text-brand">{t(group.name)}</h2>
                <p className="text-sm text-zinc-600">{t(group.blurb)}</p>
                <p className="mt-3 mb-5 flex-1 text-sm">{games.map((g) => t(g.name)).join(", ")}</p>
                <span className="btn-green">{t("View games ({count})", { count: games.length })}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      </CompetitionBrowser>
      </div>
    </>
  );
}

export function GroupView({ groupId }: { groupId: string }) {
  const { competitions } = useData();
  const group = GROUPS.find((g) => g.id === groupId);
  if (!group) return <NotAvailable ready />;
  return (
    <>
      <PageHeader title={group.name} subtitle={group.blurb} crumbs={[{ href: "/activities", label: "Activities" }]} />
      <div className="container-page py-12">
        <CompetitionBrowser key={group.id} items={competitions.filter((c) => c.group === group.id && c.enabled)} />
      </div>
    </>
  );
}

export function TalentView() {
  const { competitions } = useData();
  return (
    <>
      <PageHeader title="Talent" subtitle="Pick your talent and take the stage" />
      <div className="container-page py-12">
        <CompetitionBrowser items={competitions.filter((c) => c.type === "talent" && c.enabled)} />
      </div>
    </>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const t = useT();
  if (!items.length) return null;
  return (
    <section className="card p-6">
      <h2 className="font-display text-2xl font-semibold text-brand">{t(title)}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-700 marker:text-accent">
        {items.map((item, i) => <li key={i}>{t(item)}</li>)}
      </ul>
    </section>
  );
}

/** One template for every game and talent competition. */
export function DetailView({ type, slug, groupId }: { type: CompetitionType; slug: string; groupId?: string }) {
  const t = useT();
  const { competitions } = useData();
  const ready = useReady();
  const c = competitions.find((x) => x.slug === slug && x.type === type && (!groupId || x.group === groupId));
  if (!c || !c.enabled) return <NotAvailable ready={ready} />;
  const group = GROUPS.find((g) => g.id === c.group);
  const crumbs = type === "activity" && group
    ? [{ href: "/activities", label: "Activities" }, { href: `/activities/${group.id}`, label: group.name }]
    : [{ href: "/talent", label: "Talent" }];
  const ages = AGE_CATEGORIES.filter((a) => c.ageCategories.includes(a.id));
  const register = <Link href={`/register/${c.slug}`} className="btn-primary w-full">{t("Register Now")}</Link>;

  return (
    <>
      <PageHeader title={c.name} subtitle={c.summary} crumbs={crumbs} />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Picture id={c.image} alt={t(c.name)} icon={c.icon} tone={c.type} className="h-64 w-full rounded-2xl sm:h-80" />
          <section>
            <h2 className="font-display text-2xl font-semibold text-brand">{t("About this competition")}</h2>
            <p className="mt-2 whitespace-pre-line text-zinc-700">{t(c.description)}</p>
          </section>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="card p-6">
              <h2 className="font-semibold text-brand">{t("Individual participation")}</h2>
              <p className="mt-2 text-sm">{c.allowIndividual ? t("Allowed: 1 person. Fee {fee}", { fee: money(c.individualFee) }) : t("Not available")}</p>
            </section>
            <section className="card p-6">
              <h2 className="font-semibold text-brand">{t("Group participation")}</h2>
              <p className="mt-2 text-sm">
                {c.allowGroup ? t("Allowed: {min} to {max} members. Team fee {fee}", { min: c.minMembers, max: c.maxMembers, fee: money(c.groupFee) }) : t("Not available")}
              </p>
            </section>
          </div>
          <ListBlock title="Participation guidelines" items={c.guidelines} />
          <ListBlock title="Rules and regulations" items={c.rules} />
          <ListBlock title="Terms and conditions" items={c.terms} />
          {c.extraInfo && (
            <section className="rounded-2xl bg-brand-light p-6">
              <h2 className="font-semibold text-brand">{t("Additional information")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm">{t(c.extraInfo)}</p>
            </section>
          )}
          {register}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-gradient-to-br from-gold to-amber-300 p-6 text-center text-brand-dark">
            <p className="text-sm font-semibold uppercase">{t("Winning prize")}</p>
            <p className="font-display text-5xl font-bold">{money(c.prize)}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-brand">{t("Age categories")}</h2>
            <ul className="mt-3 mb-5 flex flex-wrap gap-2">
              {ages.map((a) => <li key={a.id} className="rounded-full bg-brand-light px-3 py-1 text-sm">{t("{range} years", { range: a.id.replace("-", "–") })}</li>)}
            </ul>
            {register}
          </div>
        </aside>
      </div>
    </>
  );
}
