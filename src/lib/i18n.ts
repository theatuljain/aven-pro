"use client";

// English text is the key. Anything without a Hindi entry (for example text the
// admin has changed) is shown exactly as written.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { hi } from "./hi";

export type Lang = "en" | "hi";

const KEY = "avenpro-lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

function read(): Lang {
  if (current) return current;
  try {
    current = window.localStorage.getItem(KEY) === "hi" ? "hi" : "en";
  } catch {
    current = "en";
  }
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // The choice still applies until the page is reloaded.
  }
  listeners.forEach((listener) => listener());
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, (): Lang => "en");
  useEffect(() => {
    document.documentElement.lang = lang;
    // Leaving the public website (for the admin panel) restores English.
    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);
  return lang;
}

export function useT() {
  const lang = useSyncExternalStore(subscribe, read, (): Lang => "en");
  return useCallback(
    (text: string, values: Record<string, string | number> = {}) => {
      const template = lang === "hi" && Object.hasOwn(hi, text) ? hi[text] : text;
      return template.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
    },
    [lang],
  );
}
