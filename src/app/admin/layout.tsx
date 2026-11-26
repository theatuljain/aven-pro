import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate, AdminNav } from "@/components/admin/Shell";

export const metadata: Metadata = { title: "Admin | AvenPro", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 lg:flex-row">
      <aside className="bg-brand-dark lg:w-60 lg:shrink-0">
        <p className="px-5 pt-4 font-display text-2xl font-bold text-white">AVENPRO <span className="text-gold">Admin</span></p>
        <Suspense fallback={<div className="h-14" />}>
          <AdminNav />
        </Suspense>
      </aside>
      <div className="min-w-0 flex-1">
        <p className="bg-amber-100 px-5 py-2 text-xs font-medium text-amber-900">
          Prototype: no login yet, and data is saved only in this browser. Do not enter real participant details.
        </p>
        <main className="p-5 lg:p-8"><AdminGate>{children}</AdminGate></main>
      </div>
    </div>
  );
}
