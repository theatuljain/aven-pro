"use client";

import { useState } from "react";
import { LIMITS, deleteFile, saveFile } from "@/lib/media";
import { updateMedia, updateSite, useData } from "@/lib/store";
import type { MediaItem, SiteDocument } from "@/lib/types";
import { Picture, Video } from "../Media";
import { Title } from "./common";

/** Removes a deleted file from every place that was using it. */
function removeMedia(d: SiteDocument, id: string): SiteDocument {
  const drop = (value: string) => (value === id ? "" : value);
  const { content } = d;
  return {
    ...d,
    competitions: d.competitions.map((c) => ({ ...c, image: drop(c.image) })),
    content: {
      ...content,
      hero: { ...content.hero, image: drop(content.hero.image) },
      about: { ...content.about, image: drop(content.about.image), video: drop(content.about.video ?? "") },
      team: content.team.map((p) => ({ ...p, image: drop(p.image) })),
    },
  };
}

export function MediaManager() {
  const { media } = useData();
  const [messages, setMessages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    setBusy(true);
    const log: string[] = [];
    for (const file of files) {
      const kind = LIMITS.image.types.includes(file.type) ? "image" : LIMITS.video.types.includes(file.type) ? "video" : null;
      if (!kind) { log.push(`${file.name}: file type not allowed.`); continue; }
      if (file.size > LIMITS[kind].maxMb * 1024 * 1024) { log.push(`${file.name}: larger than ${LIMITS[kind].maxMb} MB.`); continue; }
      const item: MediaItem = { id: crypto.randomUUID(), name: file.name, kind, inGallery: true };
      try {
        await saveFile(item.id, file);
        if (!updateMedia((items) => [item, ...items])) throw new Error("save failed");
        log.push(`${file.name}: uploaded.`);
      } catch {
        log.push(`${file.name}: could not be saved.`);
      }
    }
    setMessages(log);
    setBusy(false);
    input.value = "";
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    const error = await updateSite((d) => removeMedia(d, item.id));
    if (error) return window.alert(error);
    if (updateMedia((items) => items.filter((m) => m.id !== item.id))) await deleteFile(item.id).catch(() => {});
  }

  const setGallery = (id: string, inGallery: boolean) =>
    updateMedia((items) => items.map((m) => (m.id === id ? { ...m, inGallery } : m)));

  const shown = media.filter((m) => !filter || m.kind === filter);
  return (
    <>
      <Title text="Upload photos and videos, and choose what shows in the gallery">Media & Gallery</Title>
      <p className="mb-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-900">Photos and videos are still saved only on this device, so visitors cannot see them yet. Online file storage is the next step.</p>
      <div className="card mb-6 border-2 border-dashed p-6">
        <label className="block font-semibold" htmlFor="upload">Upload files</label>
        <p className="mb-3 text-sm text-zinc-600">Images: JPG, PNG, WebP up to {LIMITS.image.maxMb} MB. Videos: MP4, WebM up to {LIMITS.video.maxMb} MB. New files show in the gallery; untick to hide.</p>
        <input id="upload" type="file" multiple disabled={busy} accept={[...LIMITS.image.types, ...LIMITS.video.types].join(",")} onChange={upload}
          className="text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2 file:font-semibold file:text-white" />
        <ul role="status" className="mt-3 text-sm">{busy ? <li>Uploading…</li> : messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
      </div>
      <select className="input mb-4" aria-label="Filter media" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All media</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
      </select>
      {!shown.length && <p className="card p-8 text-center text-zinc-500">No files uploaded yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((item) => (
          <li key={item.id} className="card overflow-hidden">
            {item.kind === "image" ? <Picture id={item.id} alt={item.name} icon="📷" className="h-40 w-full" /> : <Video id={item.id} className="h-40 w-full" />}
            <div className="space-y-2 p-3 text-sm">
              <p className="truncate font-medium" title={item.name}>{item.name}</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={item.inGallery} onChange={(e) => setGallery(item.id, e.target.checked)} />
                Show in gallery
              </label>
              <button type="button" className="cursor-pointer font-semibold text-accent" onClick={() => remove(item)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
