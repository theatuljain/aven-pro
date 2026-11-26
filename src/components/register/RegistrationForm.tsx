"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { AGE_CATEGORIES } from "@/lib/seed";
import { updateData } from "@/lib/store";
import type { Competition, Registration, RegistrationType, TeamMember } from "@/lib/types";
import { isEmail, isPhone, money } from "@/lib/utils";
import { Field } from "../Field";
import { AgeSelect } from "./AgeSelect";

const EMPTY = { teamName: "", participantName: "", phone: "", email: "", city: "", ageCategory: "", age: "", guardianName: "", guardianPhone: "" };

const newReference = () => `REG-${Date.now().toString(36).toUpperCase()}`;

export function RegistrationForm({ type, competition: c, onDone }: { type: RegistrationType; competition: Competition; onDone: (r: Registration) => void }) {
  const t = useT();
  const isGroup = type === "group";
  const [form, setForm] = useState(EMPTY);
  const [count, setCount] = useState(c.minMembers);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the count inside the limits even if the admin changes them.
  const size = Math.min(Math.max(count, c.minMembers), c.maxMembers);
  const amount = isGroup ? c.groupFee : c.individualFee;
  const ages = AGE_CATEGORIES.filter((a) => c.ageCategories.includes(a.id));
  const age = ages.find((a) => a.id === form.ageCategory);
  const isMinor = age ? age.max < 18 : false;
  const member = (i: number): TeamMember => members[i] ?? { name: "", age: "" };

  const bind = (name: keyof typeof EMPTY) => ({
    className: "input",
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [name]: e.target.value }),
  });

  const setMember = (i: number, change: Partial<TeamMember>) => {
    const next = Array.from({ length: Math.max(members.length, i + 1) }, (_, n) => member(n));
    next[i] = { ...next[i], ...change };
    setMembers(next);
  };

  const ageOk = (value: string) => {
    const n = Number(value);
    return !!age && Number.isInteger(n) && n >= age.min && n <= age.max;
  };

  /** Changing the category clears any age that no longer fits it. */
  function chooseCategory(id: string) {
    const next = ages.find((a) => a.id === id);
    const keep = (value: string) => (next && Number(value) >= next.min && Number(value) <= next.max ? value : "");
    setForm({ ...form, ageCategory: id, age: keep(form.age) });
    setMembers(members.map((m) => ({ ...m, age: keep(m.age) })));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const e: Record<string, string> = {};
    if (isGroup && !form.teamName.trim()) e.teamName = t("Enter the team name.");
    if (!form.participantName.trim()) e.participantName = t("Enter the name.");
    if (!isPhone(form.phone)) e.phone = t("Enter a valid 10-digit mobile number.");
    if (form.email && !isEmail(form.email)) e.email = t("Enter a valid email address.");
    if (!age) e.ageCategory = t("Select an age category.");
    if (!isGroup && age && !ageOk(form.age)) e.age = t("Age must be between {min} and {max}.", { min: age.min, max: age.max });
    if (isGroup) {
      for (let i = 0; i < size; i++) {
        if (!member(i).name.trim()) e[`member${i}`] = t("Enter the member's name.");
        else if (age && !ageOk(member(i).age)) e[`member${i}`] = t("Age must be between {min} and {max}.", { min: age.min, max: age.max });
      }
    }
    if (isMinor) {
      if (!form.guardianName.trim()) e.guardianName = t("Enter the parent or guardian name.");
      if (!isPhone(form.guardianPhone)) e.guardianPhone = t("Enter a valid 10-digit mobile number.");
      if (!consent) e.consent = t("Parent or guardian consent is required.");
    }
    setErrors(e);
    if (!age || Object.keys(e).length) return;

    const registration: Registration = {
      id: newReference(),
      type,
      competitionSlug: c.slug,
      competitionName: c.name,
      participantName: form.participantName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      teamName: isGroup ? form.teamName.trim() : "",
      members: isGroup ? Array.from({ length: size }, (_, i) => member(i)) : [{ name: form.participantName.trim(), age: form.age }],
      ageCategory: age.label,
      guardianName: isMinor ? form.guardianName.trim() : "",
      guardianPhone: isMinor ? form.guardianPhone.trim() : "",
      amount,
      paymentStatus: "Pending",
      createdAt: new Date().toISOString(),
    };
    if (!updateData((d) => ({ ...d, registrations: [registration, ...d.registrations] }))) {
      setErrors({ form: t("Could not save. Browser storage may be full or blocked.") });
      return;
    }
    onDone(registration);
    window.scrollTo({ top: 0 });
  }

  return (
    <form noValidate onSubmit={submit} className="card mt-6 space-y-5 p-6">
      <h2 className="font-display text-2xl font-semibold text-brand">{t(isGroup ? "Group registration" : "Individual registration")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {isGroup && <Field label={t("Team name *")} error={errors.teamName}><input {...bind("teamName")} /></Field>}
        <Field label={t(isGroup ? "Team leader name *" : "Participant name *")} error={errors.participantName}><input {...bind("participantName")} autoComplete="name" /></Field>
        <Field label={t(isGroup ? "Leader mobile number *" : "Mobile number *")} error={errors.phone}><input {...bind("phone")} type="tel" inputMode="numeric" maxLength={10} /></Field>
        <Field label={t("Email (optional)")} error={errors.email}><input {...bind("email")} type="email" autoComplete="email" /></Field>
        <Field label={t("City (optional)")}><input {...bind("city")} /></Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("Age category *")}</legend>
        <div className="flex flex-wrap gap-2">
          {ages.map((a) => (
            <label key={a.id} className={`cursor-pointer rounded-full border px-4 py-2 text-sm has-focus-visible:ring-2 has-focus-visible:ring-gold ${form.ageCategory === a.id ? "border-brand bg-brand text-white" : "border-zinc-300"}`}>
              <input type="radio" name="ageCategory" className="sr-only" checked={form.ageCategory === a.id} onChange={() => chooseCategory(a.id)} />
              {t("{range} years", { range: a.id.replace("-", "–") })}
            </label>
          ))}
        </div>
        {errors.ageCategory && <p role="alert" className="mt-1 text-xs font-medium text-accent">{errors.ageCategory}</p>}
      </fieldset>

      {!isGroup && (
        <Field label={t("Participant age *")} error={errors.age} hint={age && t("Only ages {min} to {max} are listed", { min: age.min, max: age.max })}>
          <AgeSelect range={age} value={form.age} onChange={(value) => setForm({ ...form, age: value })} />
        </Field>
      )}

      {isGroup && (
        <>
          <Field label={t("Number of team members (including leader) *")} hint={t("Between {min} and {max}", { min: c.minMembers, max: c.maxMembers })}>
            <select className="input" value={size} onChange={(e) => setCount(Number(e.target.value))}>
              {Array.from({ length: c.maxMembers - c.minMembers + 1 }, (_, i) => c.minMembers + i).map((n) => <option key={n} value={n}>{t("{count} members", { count: n })}</option>)}
            </select>
          </Field>
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-medium">{t("Team member details *")}</legend>
            {Array.from({ length: size }, (_, i) => (
              <div key={i}>
                <div className="grid grid-cols-[1.5rem_1fr_8rem] items-center gap-2">
                  <span className="text-sm text-zinc-500">{i + 1}.</span>
                  <input className="input" aria-label={t("Member {number} name", { number: i + 1 })} placeholder={t("Full name")} value={member(i).name} onChange={(e) => setMember(i, { name: e.target.value })} />
                  <AgeSelect range={age} label={t("Member {number} age", { number: i + 1 })} value={member(i).age} onChange={(value) => setMember(i, { age: value })} />
                </div>
                {errors[`member${i}`] && <p role="alert" className="ml-10 mt-1 text-xs font-medium text-accent">{errors[`member${i}`]}</p>}
              </div>
            ))}
          </fieldset>
        </>
      )}

      {isMinor && (
        <fieldset className="space-y-3 rounded-xl bg-amber-50 p-4">
          <legend className="sr-only">{t("Parent or guardian consent")}</legend>
          <p className="text-sm font-semibold">{t("Parent / guardian details (under 18)")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Parent / guardian name *")} error={errors.guardianName}><input {...bind("guardianName")} /></Field>
            <Field label={t("Parent / guardian mobile *")} error={errors.guardianPhone}><input {...bind("guardianPhone")} type="tel" maxLength={10} /></Field>
          </div>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            {t(isGroup ? "A parent or guardian has given permission for every member to take part." : "A parent or guardian has given permission for this participant to take part.")}
          </label>
          {errors.consent && <p role="alert" className="text-xs font-medium text-accent">{errors.consent}</p>}
        </fieldset>
      )}

      <dl className="space-y-1 rounded-xl bg-brand-light p-4 text-sm" aria-live="polite">
        <div className="flex justify-between text-base font-bold text-brand"><dt>{t("Total registration amount")}</dt><dd>{money(amount)}</dd></div>
        {isGroup && (
          <>
            <div className="flex justify-between"><dt>{t("Number of members")}</dt><dd>{size}</dd></div>
            <div className="flex justify-between"><dt>{t("Per member contribution")}</dt><dd>{money(amount / size)}</dd></div>
          </>
        )}
      </dl>

      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm font-medium text-accent">{errors.form ?? t("Please correct the highlighted fields.")}</p>}
      <button type="submit" className="btn-primary w-full">{t("Submit and continue to payment")}</button>
    </form>
  );
}
