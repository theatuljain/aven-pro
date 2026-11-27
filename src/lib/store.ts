"use client";

// Website data lives in the database and is reached through the API.
// Uploaded photos and videos are still kept only in the admin's browser.
import { useEffect, useSyncExternalStore } from "react";
import { seedData } from "./seed";
import type { MediaItem, SiteData, SiteDocument } from "./types";

const MEDIA_KEY = "avenpro-media-v1";
const listeners = new Set<() => void>();
const server: SiteData = seedData;

let site: SiteDocument | null = null;
let loadError = "";
let loading: Promise<void> | null = null;
let media: MediaItem[] | null = null;
let snapshot: SiteData | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((listener) => listener());
}

function readMedia(): MediaItem[] {
  if (media) return media;
  try {
    media = JSON.parse(window.localStorage.getItem(MEDIA_KEY) ?? "[]") as MediaItem[];
  } catch {
    media = [];
  }
  return media;
}

function read(): SiteData {
  snapshot ??= {
    competitions: site?.competitions ?? seedData.competitions,
    content: site?.content ?? seedData.content,
    media: readMedia(),
  };
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === MEDIA_KEY || event.key === null) {
      media = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export async function api<T>(url: string, method = "GET", body?: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not connect. Check the internet connection and try again.", 0);
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result === null) throw new ApiError(result?.error ?? "Something went wrong. Please try again.", response.status);
  return result as T;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Fetches the latest website data. */
export function loadSite(): Promise<void> {
  loading ??= api<SiteDocument>("/api/site")
    .then((result) => {
      site = result;
      loadError = "";
    })
    .catch((error: Error) => {
      loadError = error.message;
    })
    .finally(() => {
      loading = null;
      emit();
    });
  return loading;
}

/** Saves an admin change. Returns an error message, or "" when saved. */
export async function updateSite(change: (data: SiteDocument) => SiteDocument): Promise<string> {
  try {
    // If someone else saved in between, apply the change again on the newer data.
    for (let attempt = 0; attempt < 2; attempt++) {
      const latest = await api<SiteDocument>("/api/site");
      try {
        site = await api<SiteDocument>("/api/admin/site", "PUT", change(latest));
        emit();
        return "";
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 409) throw error;
      }
    }
    return "The data changed in another window. Please try again.";
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return "Your session has ended. Reload the page and sign in again.";
    return error instanceof Error ? error.message : "Could not save.";
  }
}

/** Returns false if the browser could not save the change. */
export function updateMedia(change: (items: MediaItem[]) => MediaItem[]): boolean {
  media = null;
  const next = change(readMedia());
  try {
    window.localStorage.setItem(MEDIA_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  media = next;
  emit();
  return true;
}

export function useData() {
  const data = useSyncExternalStore(subscribe, read, () => server);
  // Load once, and refresh when the visitor returns to the tab.
  useEffect(() => {
    if (!site) void loadSite();
    const refresh = () => {
      if (document.visibilityState === "visible") void loadSite();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  return data;
}

/** True once data from the database has arrived. */
export function useReady() {
  return useSyncExternalStore(subscribe, () => !!site, () => false);
}

export function useLoadError() {
  return useSyncExternalStore(subscribe, () => (site ? "" : loadError), () => "");
}
