"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError, api, loadSite, useLoadError, useReady } from "@/lib/store";
import type { Registration } from "@/lib/types";

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

interface RegistrationList {
  registrations: Registration[];
  loaded: boolean;
  error: string;
  refresh: () => void;
}

const RegistrationsContext = createContext<RegistrationList>({ registrations: [], loaded: false, error: "", refresh: () => {} });
export const useRegistrations = () => useContext(RegistrationsContext);

function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/session", "POST", { password });
      onSignedIn();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="card mx-auto mt-10 max-w-sm space-y-4 p-6">
      <h1 className="font-display text-3xl font-bold text-brand">Admin sign in</h1>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input type="password" required autoFocus autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

/** Shows the admin pages only after sign in. The APIs check the sign in again. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [list, setList] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");
  const ready = useReady();
  const siteError = useLoadError();

  const refresh = useCallback(() => {
    api<Registration[]>("/api/admin/registrations")
      .then((result) => {
        setList(result);
        setError("");
      })
      .catch((e: Error) => {
        if (e instanceof ApiError && e.status === 401) setSignedIn(false);
        else setError(e.message);
      });
  }, []);

  const check = useCallback(() => {
    api<{ signedIn: boolean }>("/api/admin/session")
      .then((result) => setSignedIn(result.signedIn))
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(check, [check]);
  useEffect(() => {
    if (!signedIn) return;
    void loadSite();
    refresh();
    // New registrations appear without reloading the page.
    const timer = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(timer);
  }, [signedIn, refresh]);

  if (signedIn === false) return <Login onSignedIn={() => setSignedIn(true)} />;
  if (!signedIn || !ready) return <p role="status" className="text-zinc-500">{(!signedIn && error) || siteError || "Loading…"}</p>;

  async function signOut() {
    await api("/api/admin/session", "DELETE").catch(() => {});
    setList(null);
    setSignedIn(false);
  }

  return (
    <RegistrationsContext value={{ registrations: list ?? [], loaded: !!list, error, refresh }}>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-outline" onClick={signOut}>Sign out</button>
      </div>
      {children}
    </RegistrationsContext>
  );
}
