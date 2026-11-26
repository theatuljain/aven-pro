"use client";

// Prototype data layer: everything is kept in this browser's localStorage.
// Replace this file with real API calls when the backend is added.
import { useSyncExternalStore } from "react";
import { seedData } from "./seed";
import type { SiteData } from "./types";

const KEY = "avenpro-data-v1";
const listeners = new Set<() => void>();
let cache: SiteData | null = null;

function read(): SiteData {
  if (cache) return cache;
  try {
    const saved = window.localStorage.getItem(KEY);
    const stored = saved ? (JSON.parse(saved) as Partial<SiteData>) : null;
    cache = stored ? { ...seedData, ...stored, content: { ...seedData.content, ...stored.content } } : seedData;
  } catch {
    cache = seedData;
  }
  return cache;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns false if the browser could not save the change. */
export function updateData(change: (data: SiteData) => SiteData): boolean {
  // Read fresh so a change made in another tab is not overwritten.
  cache = null;
  const next = change(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  cache = next;
  emit();
  return true;
}

export function resetData() {
  window.localStorage.removeItem(KEY);
  cache = null;
  emit();
}

export function useData() {
  return useSyncExternalStore(subscribe, read, () => seedData);
}

/** True once saved browser data is available. */
export function useReady() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
