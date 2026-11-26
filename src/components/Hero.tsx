"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMediaUrl } from "@/lib/media";
import { AGE_CATEGORIES } from "@/lib/seed";
import { useData } from "@/lib/store";
import type { Competition } from "@/lib/types";
import { competitionPath, money } from "@/lib/utils";
import { Picture } from "./Media";

const ROTATE_MS = 4500;

/** Highest prizes first, alternating between sports and talent. */
function pickFeatured(list: Competition[]) {
  const byPrize = (type: Competition["type"]) =>
    list.filter((c) => c.type === type).sort((a, b) => b.prize - a.prize).slice(0, 3);
  const sports = byPrize("activity");
  const talent = byPrize("talent");
  return [0, 1, 2].flatMap((i) => [sports[i], talent[i]]).filter(Boolean);
}

function Spotlight({ items, paused }: { items: Competition[]; paused: boolean }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (paused || held || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => i + 1), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, held, items.length]);

  const active = index % items.length;
  const c = items[active];
  const ages = AGE_CATEGORIES.filter((a) => c.ageCategories.includes(a.id));

  return (
    <div className="relative mx-auto w-full max-w-md" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
      <Image src="/aven-logo.jpeg" alt="S.S.D.N AvenPro Universal Sports & Talent Federation logo" width={128} height={128} preload
        className="absolute -top-10 -right-2 z-10 size-24 rounded-full border-4 border-gold bg-white object-contain p-1 shadow-xl sm:-right-3 sm:size-28 xl:-right-8" />
      <article key={c.slug} className="animate-card-in overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)]">
        <Picture id={c.image} alt={t(c.name)} icon={c.icon} tone={c.type} className="h-48 w-full" />
        <div className="p-6">
          <h2 className="font-display text-4xl font-extrabold italic text-brand-dark">{t(c.name)}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {t("Win")} <strong className="text-lg text-accent">{money(c.prize)}</strong>
          </p>
          <p className="mt-1 text-sm text-zinc-600">{t("Ages {ages}", { ages: ages.map((a) => a.id.replace("-", "–")).join(", ") })}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href={`/register/${c.slug}`} className="btn-primary">{t("Register now")}</Link>
            <Link href={competitionPath(c)} className="btn-outline">{t("View details")}</Link>
          </div>
        </div>
      </article>
      <div className="mt-4 flex justify-center gap-2" role="group" aria-label={t("Choose a featured competition")}>
        {items.map((item, i) => (
          <button key={item.slug} type="button" aria-label={t("Show {name}", { name: t(item.name) })} aria-pressed={i === active} onClick={() => setIndex(i)}
            className={`flex size-11 cursor-pointer items-center justify-center rounded-xl text-xl transition ${i === active ? "scale-110 bg-gold" : "bg-white/15 hover:bg-white/30"}`}>
            <span aria-hidden>{item.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Scrolling strip with every open competition. */
function Ribbon({ items, paused }: { items: Competition[]; paused: boolean }) {
  const t = useT();
  return (
    <div className="ribbon relative z-10 -mx-2 -mt-5 -rotate-1 bg-gold py-3 shadow-lg" data-paused={paused}>
      <div className="ribbon-track flex w-max">
        {[false, true].map((copy) => (
          <ul key={String(copy)} aria-hidden={copy || undefined} className={`flex shrink-0 ${copy ? "ribbon-copy" : ""}`}>
            {items.map((c) => (
              <li key={c.slug}>
                <Link href={competitionPath(c)} tabIndex={copy ? -1 : undefined} className="flex items-center gap-2 px-6 font-display text-xl font-bold whitespace-nowrap text-brand-dark italic hover:underline">
                  <span aria-hidden>{c.icon}</span>{t(c.name)}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const t = useT();
  const { content, competitions } = useData();
  const { hero } = content;
  const banner = useMediaUrl(hero.image);
  const [paused, setPaused] = useState(false);
  const open = competitions.filter((c) => c.enabled);
  const featured = pickFeatured(open);

  return (
    <div className="overflow-x-clip">
      <section className="stadium relative overflow-hidden text-white">
        {banner && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(4,35,18,.8), rgba(4,35,18,.8)), url(${banner})` }} />
        )}
        <div aria-hidden className="floodlight left-[8%]" />
        <div aria-hidden className="floodlight floodlight-right right-[8%]" />
        <div className="container-page relative grid items-center gap-16 pt-14 pb-20 lg:grid-cols-[1.25fr_1fr] lg:pt-20 lg:pb-24">
          <div className="text-center lg:text-left">
            <h1 className="hero-title font-display text-5xl leading-[0.95] font-extrabold text-balance italic sm:text-7xl xl:text-8xl">{t(hero.title)}</h1>
            <p className="mt-6 font-display text-2xl font-semibold text-gold italic sm:text-3xl">{t(hero.tagline)}</p>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/85 sm:text-lg lg:mx-0">{t(hero.intro)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/activities" className="btn-primary px-8 py-3.5 text-base">{t(hero.primaryCta)}</Link>
              <Link href="/talent" className="btn-gold px-8 py-3.5 text-base">{t(hero.secondaryCta)}</Link>
            </div>
            <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} className="mt-6 cursor-pointer text-sm text-white/70 underline underline-offset-4 hover:text-white motion-reduce:hidden">
              {t(paused ? "Play animation" : "Pause animation")}
            </button>
          </div>
          {featured.length > 0 && <Spotlight items={featured} paused={paused} />}
        </div>
      </section>
      {open.length > 0 && <Ribbon items={open} paused={paused} />}
    </div>
  );
}
