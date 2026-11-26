"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLang, useT } from "@/lib/i18n";
import { useData } from "@/lib/store";

let now = 0;

/** A clock that ticks every second. It reads 0 until the browser is ready. */
function subscribeClock(listener: () => void) {
  const tick = () => {
    now = Date.now();
    listener();
  };
  const first = window.setTimeout(tick, 0);
  const timer = window.setInterval(tick, 1000);
  return () => {
    window.clearTimeout(first);
    window.clearInterval(timer);
  };
}

function Countdown({ target }: { target: number }) {
  const t = useT();
  const time = useSyncExternalStore(subscribeClock, () => now, () => 0);
  if (!time) return null;
  const left = Math.floor((target - time) / 1000);
  if (left <= 0) return <p className="font-display text-2xl font-bold text-accent italic">{t("The event has started.")}</p>;
  const parts = [
    ["Days", Math.floor(left / 86400)],
    ["Hours", Math.floor(left / 3600) % 24],
    ["Minutes", Math.floor(left / 60) % 60],
    ["Seconds", left % 60],
  ] as const;
  return (
    <div role="timer" className="grid grid-cols-4 gap-2 sm:gap-3">
      {parts.map(([label, value]) => (
        <div key={label} className="min-w-16 rounded-2xl bg-brand-dark px-2 py-3 text-center text-white sm:min-w-20">
          <span className="block font-display text-3xl font-extrabold text-gold tabular-nums sm:text-4xl">{String(value).padStart(2, "0")}</span>
          <span className="text-xs">{t(label)}</span>
        </div>
      ))}
    </div>
  );
}

export function EventBanner() {
  const t = useT();
  const lang = useLang();
  const { event } = useData().content;
  const target = event.date ? new Date(event.date).getTime() : NaN;
  const hasDate = Number.isFinite(target);
  const date = hasDate
    ? new Date(target).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { dateStyle: "full", timeStyle: "short" })
    : t("Date to be announced");

  return (
    <section aria-label={t("Event date")} className="container-page pt-14">
      <div className="flex flex-col items-center gap-6 rounded-[2rem] border-2 border-gold bg-amber-50 p-6 text-center lg:flex-row lg:justify-between lg:p-8 lg:text-left">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-brand-dark italic sm:text-4xl">{t(event.name)}</h2>
          <dl className="mt-3 space-y-1 text-sm sm:text-base">
            <div><dt className="inline font-semibold">{t("Event date")}: </dt><dd className="inline">{date}</dd></div>
            <div><dt className="inline font-semibold">{t("Venue")}: </dt><dd className="inline">{t(event.venue || "Venue to be announced")}</dd></div>
          </dl>
        </div>
        {hasDate ? <Countdown target={target} /> : <Link href="/#categories" className="btn-primary">{t("View competitions")}</Link>}
      </div>
    </section>
  );
}
