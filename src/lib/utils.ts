import type { Competition } from "./types";

export const money = (value: number) =>
  "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const competitionPath = (c: Competition) =>
  c.type === "activity" ? `/activities/${c.group}/${c.slug}` : `/talent/${c.slug}`;

export const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const isPhone = (value: string) => /^[6-9]\d{9}$/.test(value.trim());
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
