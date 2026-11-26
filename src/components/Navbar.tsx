"use client";

import { setLang, useLang, useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/activities", label: "Activities" },
  { href: "/talent", label: "Talent" },
  { href: "/#team", label: "Team" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useT();
  const lang = useLang();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand bg-white/95 shadow-sm backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/aven-logo.jpeg" alt="AvenPro logo" width={52} height={52} loading="eager" />
          <span className="font-display text-2xl font-bold text-brand max-sm:hidden">
            AVEN<span className="text-accent">PRO</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 xl:order-last xl:ml-2">
          <button type="button" className="btn-outline px-3 py-2" lang={lang === "en" ? "hi" : "en"} onClick={() => setLang(lang === "en" ? "hi" : "en")}>
            {lang === "en" ? "हिंदी" : "English"}
          </button>
          <Link href="/#categories" className="btn-primary px-3 py-2 max-[22rem]:hidden">{t("Register")}</Link>
          <button type="button" className="btn-outline px-3 py-2 xl:hidden" aria-label={t(open ? "Close" : "Menu")} aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
          </button>
        </div>
        <ul id="main-menu" className={`${open ? "flex" : "hidden"} xl:ml-auto absolute inset-x-0 top-full flex-col border-b bg-white p-3 shadow-lg xl:static xl:flex xl:flex-row xl:gap-1 xl:border-0 xl:p-0 xl:shadow-none`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setOpen(false)} className={`block rounded-full px-3 py-2 text-sm font-medium hover:bg-brand-light ${isActive(link.href) ? "bg-brand-light text-brand" : ""}`}>
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
