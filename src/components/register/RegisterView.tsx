"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { useData, useReady } from "@/lib/store";
import type { PublicRegistration, RegistrationType } from "@/lib/types";
import { competitionPath } from "@/lib/utils";
import { NotAvailable, PageHeader } from "../Cards";
import { PaymentPanel } from "./PaymentPanel";
import { RegistrationForm } from "./RegistrationForm";

const OPTIONS: { type: RegistrationType; icon: string; title: string; text: string }[] = [
  { type: "individual", icon: "🧍", title: "Register as an Individual", text: "One participant" },
  { type: "group", icon: "👥", title: "Register as a Group", text: "A team with a leader" },
];

export function RegisterView({ slug }: { slug: string }) {
  const t = useT();
  const { competitions } = useData();
  const ready = useReady();
  const router = useRouter();
  const [type, setType] = useState<RegistrationType | null>(null);
  const [done, setDone] = useState<{ registration: PublicRegistration; phone: string } | null>(null);
  // Next.js keeps hidden pages alive, so start fresh on the next visit.
  useLayoutEffect(() => () => { setType(null); setDone(null); }, []);
  const c = competitions.find((x) => x.slug === slug);
  if (!ready || !c || !c.enabled) return <NotAvailable ready={ready} />;

  const options = OPTIONS.filter((o) => (o.type === "individual" ? c.allowIndividual : c.allowGroup));
  const selected = options.some((o) => o.type === type) ? type : null;

  return (
    <>
      <PageHeader title={t("Register: {name}", { name: t(c.name) })} crumbs={[{ href: competitionPath(c), label: c.name }]} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          {done ? (
            <PaymentPanel registration={done.registration} phone={done.phone} />
          ) : (
            <>
              <div className="card mb-6 p-5">
                <label className="text-sm font-medium" htmlFor="competition">{t("Selected competition")}</label>
                <select id="competition" className="input mt-1" value={c.slug} onChange={(e) => router.replace(`/register/${e.target.value}`)}>
                  {competitions.filter((x) => x.enabled).map((x) => <option key={x.slug} value={x.slug}>{t(x.name)}</option>)}
                </select>
                <p className="mt-1 text-xs text-zinc-500">{t("Changing this clears the form below.")}</p>
              </div>
              <h2 className="mb-3 font-display text-2xl font-semibold text-brand">{t("Choose registration type")}</h2>
              {!options.length && <p className="card p-6">{t("Registration is closed for this competition.")}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {options.map((o) => (
                  <button key={o.type} type="button" aria-pressed={selected === o.type} onClick={() => setType(o.type)}
                    className={`cursor-pointer rounded-2xl border-2 p-6 text-center transition hover:border-brand ${selected === o.type ? "border-brand bg-brand-light" : "border-zinc-200 bg-white"}`}>
                    <span aria-hidden className="text-4xl">{o.icon}</span>
                    <span className="mt-2 block font-semibold">{t(o.title)}</span>
                    <span className="text-sm text-zinc-600">{t(o.text)}</span>
                  </button>
                ))}
              </div>
              {selected && <RegistrationForm key={selected} type={selected} competition={c} onDone={(registration, phone) => setDone({ registration, phone })} />}
              <p className="mt-6 text-center text-sm"><Link href="/status" className="font-semibold text-accent underline">{t("Already registered? Check your status")}</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
