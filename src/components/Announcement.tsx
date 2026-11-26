"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { useData } from "@/lib/store";

export function Announcement() {
  const t = useT();
  const { announcement } = useData().content;
  if (!announcement.enabled || !announcement.text.trim()) return null;
  const link = announcement.link.trim();
  const style = "font-semibold underline underline-offset-4";
  return (
    <div role="region" aria-label={t("Announcement")} className="bg-accent px-4 py-2 text-center text-sm text-white">
      <span>{t(announcement.text)} </span>
      {/^\/(?!\/)/.test(link) && <Link href={link} className={style}>{t("View details")}</Link>}
      {/^https?:\/\//i.test(link) && <a href={link} target="_blank" rel="noopener noreferrer" className={style}>{t("View details")}</a>}
    </div>
  );
}
