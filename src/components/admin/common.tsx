"use client";

import { useState } from "react";
import { updateSite, useData } from "@/lib/store";
import type { SiteDocument } from "@/lib/types";
import { Picture } from "../Media";

export function Title({ children, text }: { children: React.ReactNode; text?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-bold text-brand">{children}</h1>
      {text && <p className="text-sm text-zinc-600">{text}</p>}
    </div>
  );
}

/** Saves a change and reports the result to the admin. */
export function useSave() {
  const [message, setMessage] = useState("");
  const save = async (change: (d: SiteDocument) => SiteDocument) => {
    setMessage("Saving…");
    const error = await updateSite(change);
    setMessage(error || "✓ Saved");
    return !error;
  };
  const status = message && <span role="status" className={`text-sm font-medium ${/^(✓|Saving)/.test(message) ? "text-brand" : "text-accent"}`}>{message}</span>;
  return { save, status, clear: () => setMessage("") };
}

export function VideoPicker({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  const videos = useData().media.filter((m) => m.kind === "video");
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">No video (show picture or animation)</option>
        {videos.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <span className="mt-1 block text-xs text-zinc-500">Upload videos in Media & Gallery. It plays muted on repeat.</span>
    </label>
  );
}

export function ImagePicker({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  const images = useData().media.filter((m) => m.kind === "image");
  return (
    <div className="flex items-center gap-3">
      <Picture id={value} alt={label} icon="🖼️" className="size-20 shrink-0 rounded-lg" />
      <label className="flex-1">
        <span className="mb-1 block text-sm font-medium">{label}</span>
        <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Default placeholder</option>
          {images.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <span className="mt-1 block text-xs text-zinc-500">Upload new pictures in Media & Gallery.</span>
      </label>
    </div>
  );
}
