"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReady } from "@/lib/store";

const LINKS = [
  ["/admin", "📊 Dashboard"],
  ["/admin/registrations", "📝 Registrations"],
  ["/admin/activities", "🏏 Activities"],
  ["/admin/talent", "🎤 Talent"],
  ["/admin/pricing", "💰 Pricing"],
  ["/admin/media", "🖼️ Media & Gallery"],
  ["/admin/content", "✏️ Website Content"],
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-3 lg:flex-col">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === href ? "bg-gold text-brand-dark" : "text-white hover:bg-white/10"}`}>
          {label}
        </Link>
      ))}
      <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10">↗ View website</Link>
    </nav>
  );
}

/** Admin forms start from saved data, so wait until it is loaded. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  return useReady() ? <>{children}</> : <p className="text-zinc-500">Loading…</p>;
}
