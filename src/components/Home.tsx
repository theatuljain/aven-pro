"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { useData } from "@/lib/store";
import { EventBanner } from "./EventBanner";
import { Hero } from "./Hero";
import { MotivationReel } from "./MotivationReel";
import { Picture, Video } from "./Media";

function Heading({ children, text }: { children: React.ReactNode; text?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-4xl font-extrabold text-brand-dark italic sm:text-5xl">{children}</h2>
      <span aria-hidden className="mx-auto mt-3 block h-1.5 w-24 -skew-x-30 bg-gradient-to-r from-brand via-gold to-accent" />
      {text && <p className="mx-auto mt-4 max-w-xl text-zinc-600">{text}</p>}
    </div>
  );
}

function Categories() {
  const t = useT();
  const { competitions } = useData();
  const cards = [
    { href: "/activities", title: "Activities", type: "activity", art: "art-activity", button: "See all sports" },
    { href: "/talent", title: "Talent", type: "talent", art: "art-talent", button: "See all talent events" },
  ] as const;
  return (
    <section id="categories" className="container-page py-20">
      <Heading text={t("Pick a side, or enter both.")}>{t("Where will you compete?")}</Heading>
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => {
          const items = competitions.filter((c) => c.type === card.type && c.enabled);
          return (
            <Link key={card.href} href={card.href} className={`group flex flex-col rounded-[2rem] ${card.art} p-8 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl`}>
              <h3 className="font-display text-5xl font-extrabold italic">{t(card.title)}</h3>
              <p className="mt-1 text-white/80">{t("{count} competitions open", { count: items.length })}</p>
              <ul className="mt-6 flex flex-1 flex-wrap content-start gap-2">
                {items.map((c) => (
                  <li key={c.slug} className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-sm">
                    <span aria-hidden>{c.icon}</span>{t(c.name)}
                  </li>
                ))}
              </ul>
              <span className="btn-gold mt-8 self-start group-hover:brightness-110">{t(card.button)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Steps() {
  const t = useT();
  const steps = [
    ["Choose your event", "Browse sports and talent competitions."],
    ["Read the rules", "Check the prize, age group, team size and fee."],
    ["Register", "Enter as an individual or bring your whole team."],
    ["Pay the fee", "Pay online. Payments are in test mode for now."],
  ];
  return (
    <section className="stadium py-20 text-white">
      <div className="container-page">
        <h2 className="text-center font-display text-4xl font-extrabold italic sm:text-5xl">{t("How to take part")}</h2>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="border-t-4 border-gold pt-5">
              <span aria-hidden className="font-display text-6xl font-extrabold text-gold italic">{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{t(title)}</h3>
              <p className="mt-1 text-sm text-white/75">{t(text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Home() {
  const t = useT();
  const { content, media } = useData();
  const { about, team, contact } = content;
  const gallery = media.filter((m) => m.inGallery);
  const details = [
    ["📍", "Address", contact.address],
    ["📞", "Phone", contact.phone],
    ["✉️", "Email", contact.email],
    ["🕒", "Timings", contact.hours],
  ];
  return (
    <>
      <Hero />
      <EventBanner />
      <Categories />
      <Steps />

      <section id="about" className="py-20">
        <div className="container-page grid items-center gap-8 md:grid-cols-2">
          {about.video ? (
            <Video id={about.video} loop className="aspect-video w-full rounded-[2rem] object-cover" />
          ) : about.image ? (
            <Picture id={about.image} alt={t(about.heading)} className="h-80 w-full rounded-[2rem]" />
          ) : (
            <MotivationReel />
          )}
          <div>
            <h2 className="font-display text-4xl font-extrabold text-brand-dark italic sm:text-5xl">{t(about.heading)}</h2>
            <p className="mt-4 whitespace-pre-line text-zinc-700">{t(about.body)}</p>
          </div>
        </div>
      </section>

      <section id="team" className="bg-brand-light py-20">
        <div className="container-page">
        <Heading>{t("Our Team")}</Heading>
        {team.length === 0 && <p className="text-center text-zinc-500">{t("Team details coming soon.")}</p>}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((person) => (
            <li key={person.id} className="card p-6 text-center">
              <Picture id={person.image} alt={person.name} icon="👤" className="mx-auto size-32 rounded-full" />
              <h3 className="mt-4 text-lg font-semibold">{t(person.name)}</h3>
              <p className="text-sm font-medium text-accent">{t(person.role)}</p>
              <p className="mt-2 text-sm text-zinc-600">{t(person.about)}</p>
            </li>
          ))}
        </ul>
        </div>
      </section>

      <section id="gallery" className="py-20">
        <div className="container-page">
          <Heading>{t("Gallery")}</Heading>
          {gallery.length === 0 ? (
            <p className="card p-10 text-center text-zinc-500">{t("Event photos and videos will appear here soon.")}</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <li key={item.id} className="overflow-hidden rounded-2xl shadow">
                  {item.kind === "image" ? <Picture id={item.id} alt={item.name} icon="📷" className="h-56 w-full" /> : <Video id={item.id} className="h-56 w-full" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {content.faq.length > 0 && (
        <section id="faq" className="bg-brand-light py-20">
          <div className="container-page max-w-3xl">
            <Heading>{t("Frequently asked questions")}</Heading>
            <div className="space-y-3">
              {content.faq.filter((f) => f.question.trim()).map((f) => (
                <details key={f.id} className="card group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-dark">
                    {t(f.question)}
                    <span aria-hidden className="text-2xl text-accent transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm text-zinc-700">{t(f.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="container-page py-20">
        <Heading>{t("Contact Us")}</Heading>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {details.map(([icon, label, value]) => (
            <div key={label} className="card p-5 text-center">
              <span aria-hidden className="text-3xl">{icon}</span>
              <dt className="mt-2 font-semibold text-brand">{t(label)}</dt>
              <dd className="mt-1 break-words text-sm text-zinc-600">{t(value)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
