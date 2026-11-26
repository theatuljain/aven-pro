"use client";

import Link from "next/link";
import { resetData, useData } from "@/lib/store";
import { Title } from "./common";
import { RegistrationTable } from "./Registrations";

export function Dashboard() {
  const { registrations, competitions } = useData();
  const individual = registrations.filter((r) => r.type === "individual").length;
  const stats = [
    ["Total registrations", registrations.length],
    ["Individual registrations", individual],
    ["Group registrations", registrations.length - individual],
    ["Total participants", registrations.reduce((sum, r) => sum + r.members.length, 0)],
    ["Activities", competitions.filter((c) => c.type === "activity").length],
    ["Talent competitions", competitions.filter((c) => c.type === "talent").length],
  ] as const;
  return (
    <>
      <Title text="Overview of your competition">Dashboard</Title>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card border-l-4 border-l-brand p-5">
            <dt className="text-sm text-zinc-600">{label}</dt>
            <dd className="font-display text-4xl font-bold text-brand">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold">Recent registrations</h2>
        <Link href="/admin/registrations" className="text-sm font-semibold text-accent">View all →</Link>
      </div>
      <div className="mt-3"><RegistrationTable items={registrations.slice(0, 5)} /></div>
      <button type="button" className="btn-outline mt-10" onClick={() => {
        if (window.confirm("Delete all registrations and changes made in this browser, and restore sample data?")) resetData();
      }}>Reset prototype data</button>
    </>
  );
}
