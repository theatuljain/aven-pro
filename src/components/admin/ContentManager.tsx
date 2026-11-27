"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
import type { Faq, SiteContent, TeamPerson } from "@/lib/types";
import { isUpiId } from "@/lib/upi";
import { Field } from "../Field";
import { ImagePicker, Title, VideoPicker, useSave } from "./common";

type Section = "announcement" | "event" | "hero" | "about" | "contact" | "social" | "payment";

export function ContentManager() {
  const saved = useData().content;
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const content = draft ?? saved;
  const { save, status, clear } = useSave();
  const [upiError, setUpiError] = useState("");
  const change = (next: Partial<SiteContent>) => { setDraft({ ...content, ...next }); clear(); };
  const patch = (key: Section, value: object) => change({ [key]: { ...content[key], ...value } });
  const person = (id: string, value: Partial<TeamPerson>) => change({ team: content.team.map((p) => (p.id === id ? { ...p, ...value } : p)) });

  const question = (id: string, value: Partial<Faq>) => change({ faq: content.faq.map((f) => (f.id === id ? { ...f, ...value } : f)) });

  const input = (section: Section, key: string, label: string, long = false) => {
    const props = {
      className: "input",
      value: (content[section] as Record<string, string>)[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => patch(section, { [key]: e.target.value }),
    };
    return <Field label={label}>{long ? <textarea rows={5} {...props} /> : <input {...props} />}</Field>;
  };
  const box = "card space-y-4 p-6";
  const heading = "font-display text-xl font-semibold text-brand";

  return (
    <>
      <Title text="Edit the text and pictures on your website, then press Save">Website Content</Title>
      <p className="mb-4 text-sm text-zinc-600">The Hindi version is built in for the sample text only. Text you change appears as you type it, in both languages.</p>
      <div className="space-y-6">
        <section className={box}>
          <h2 className={heading}>Announcement bar</h2>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={content.announcement.enabled} onChange={(e) => patch("announcement", { enabled: e.target.checked })} />Show the announcement at the top of the website</label>
          {input("announcement", "text", "Announcement message")}
          {input("announcement", "link", "Link (optional): a page such as /talent, or a full https:// address")}
        </section>
        <section className={box}>
          <h2 className={heading}>Event date and venue</h2>
          {input("event", "name", "Event name")}
          <Field label="Event date and time" hint="Leave empty until the date is final. The countdown appears once it is set.">
            <input type="datetime-local" className="input" value={content.event.date} onChange={(e) => patch("event", { date: e.target.value })} />
          </Field>
          {input("event", "venue", "Venue")}
        </section>
        <section className={box}>
          <h2 className={heading}>Frequently asked questions</h2>
          {content.faq.map((f) => (
            <div key={f.id} className="space-y-3 rounded-xl border border-zinc-200 p-4">
              <Field label="Question"><input className="input" value={f.question} onChange={(e) => question(f.id, { question: e.target.value })} /></Field>
              <Field label="Answer"><textarea rows={3} className="input" value={f.answer} onChange={(e) => question(f.id, { answer: e.target.value })} /></Field>
              <button type="button" className="cursor-pointer text-sm font-semibold text-accent" onClick={() => change({ faq: content.faq.filter((x) => x.id !== f.id) })}>Remove question</button>
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={() => change({ faq: [...content.faq, { id: crypto.randomUUID(), question: "", answer: "" }] })}>+ Add question</button>
        </section>
        <section className={box}>
          <h2 className={heading}>Hero section</h2>
          {input("hero", "title", "Main title")}
          {input("hero", "tagline", "Tagline")}
          {input("hero", "intro", "Introduction")}
          {input("hero", "primaryCta", "Activities button text")}
          {input("hero", "secondaryCta", "Talent button text")}
          <ImagePicker label="Background banner" value={content.hero.image} onChange={(image) => patch("hero", { image })} />
        </section>
        <section className={box}>
          <h2 className={heading}>About</h2>
          {input("about", "heading", "Heading")}
          {input("about", "body", "Text", true)}
          <ImagePicker label="About image" value={content.about.image} onChange={(image) => patch("about", { image })} />
          <VideoPicker label="About video" value={content.about.video ?? ""} onChange={(video) => patch("about", { video })} />
        </section>
        <section className={box}>
          <h2 className={heading}>Team</h2>
          {content.team.map((p) => (
            <div key={p.id} className="space-y-3 rounded-xl border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name"><input className="input" value={p.name} onChange={(e) => person(p.id, { name: e.target.value })} /></Field>
                <Field label="Role"><input className="input" value={p.role} onChange={(e) => person(p.id, { role: e.target.value })} /></Field>
              </div>
              <Field label="About"><input className="input" value={p.about} onChange={(e) => person(p.id, { about: e.target.value })} /></Field>
              <ImagePicker label="Photo" value={p.image} onChange={(image) => person(p.id, { image })} />
              <button type="button" className="cursor-pointer text-sm font-semibold text-accent" onClick={() => change({ team: content.team.filter((x) => x.id !== p.id) })}>Remove member</button>
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={() => change({ team: [...content.team, { id: crypto.randomUUID(), name: "", role: "", about: "", image: "" }] })}>+ Add member</button>
        </section>
        <section className={box}>
          <h2 className={heading}>Contact details</h2>
          {input("contact", "address", "Address")}
          {input("contact", "phone", "Phone")}
          {input("contact", "email", "Email")}
          {input("contact", "hours", "Timings")}
        </section>
        <section className={box}>
          <h2 className={heading}>Social media links</h2>
          <p className="text-sm text-zinc-600">Paste the full link, starting with https://</p>
          {input("social", "instagram", "Instagram")}
          {input("social", "facebook", "Facebook")}
          {input("social", "youtube", "YouTube")}
        </section>
        <section className={box}>
          <h2 className={heading}>UPI payment</h2>
          <p className="text-sm text-zinc-600">Money from registrations goes to this UPI ID. Check it carefully before saving.</p>
          {input("payment", "upiId", "UPI ID, for example name@bank")}
          {input("payment", "payeeName", "Name shown to the payer")}
        </section>
        <div className="sticky bottom-0 flex items-center gap-4 border-t border-zinc-200 bg-zinc-50 py-4">
          <button type="button" className="btn-primary" onClick={async () => {
            const upiId = content.payment.upiId.trim();
            if (upiId && !isUpiId(upiId)) return setUpiError("The UPI ID is not valid. It looks like name@bank.");
            setUpiError("");
            if (await save((d) => ({ ...d, content: { ...content, payment: { ...content.payment, upiId } } }))) setDraft(null);
          }}>Save changes</button>
          {upiError ? <span role="alert" className="text-sm font-medium text-accent">{upiError}</span> : status}
        </div>
      </div>
    </>
  );
}
