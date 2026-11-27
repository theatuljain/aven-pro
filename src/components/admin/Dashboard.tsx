"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { Title } from "./common";
import { RegistrationTable } from "./Registrations";
import { useRegistrations } from "./Shell";

export function Dashboard() {
  const { competitions } = useData();
  const { registrations, loaded, error } = useRegistrations();
  const individual = registrations.filter((r) => r.type === "individual").length;
  const stats = [
    ["Total registrations", registrations.length],
    ["Payments to verify", registrations.filter((r) => r.paymentStatus === "Submitted").length],
    ["Payments approved", registrations.filter((r) => r.paymentStatus === "Approved").length],
    ["Individual registrations", individual],
    ["Group registrations", registrations.length - individual],
    ["Total participants", registrations.reduce((sum, r) => sum + r.members.length, 0)],
    ["Activities", competitions.filter((c) => c.type === "activity").length],
    ["Talent competitions", competitions.filter((c) => c.type === "talent").length],
  ] as const;
  return (
    <>
      <Title text="Overview of your competition">Dashboard</Title>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
      {error && <p role="alert" className="mt-2 text-sm text-accent">{error}</p>}
      <div className="mt-3">{loaded ? <RegistrationTable items={registrations.slice(0, 5)} /> : <p className="text-zinc-500">Loading registrations…</p>}</div>
    </>
  );
}
