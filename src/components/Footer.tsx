"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { useData } from "@/lib/store";

export function Footer() {
  const t = useT();
  const { contact, social } = useData().content;
  const socials = [
    { name: "Instagram", url: social.instagram },
    { name: "Facebook", url: social.facebook },
    { name: "YouTube", url: social.youtube },
  ];
  return (
    <footer className="mt-auto border-t-4 border-gold bg-brand-dark text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold">AVENPRO</p>
          <p className="mt-2 text-sm text-white/75">{t("Universal Sports & Talent Federation (USTF). One Platform, Unlimited Talent.")}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gold">{t("Quick Links")}</p>
          <ul className="space-y-1.5 text-sm text-white/80">
            <li><Link href="/#about" className="hover:text-gold">{t("About")}</Link></li>
            <li><Link href="/activities" className="hover:text-gold">{t("Activities")}</Link></li>
            <li><Link href="/talent" className="hover:text-gold">{t("Talent")}</Link></li>
            <li><Link href="/#gallery" className="hover:text-gold">{t("Gallery")}</Link></li>
            <li><Link href="/#faq" className="hover:text-gold">{t("Frequently asked questions")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gold">{t("Contact")}</p>
          <ul className="space-y-1.5 text-sm text-white/80">
            <li>{t(contact.address)}</li>
            <li>{t(contact.phone)}</li>
            <li className="break-all">{t(contact.email)}</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gold">{t("Follow Us")}</p>
          <ul className="space-y-1.5 text-sm text-white/80">
            {socials.map((s) => (
              <li key={s.name}>
                {/^https?:\/\//i.test(s.url) ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{s.name} ↗</a>
                ) : (
                  <span className="text-white/50">{t("{name} (link coming soon)", { name: s.name })}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/15 py-4 text-center text-xs text-white/60">{t("© 2026 AvenPro (USTF). All rights reserved.")}</p>
    </footer>
  );
}
