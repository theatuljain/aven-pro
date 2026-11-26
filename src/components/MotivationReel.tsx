"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";

const LINES = [
  "Start before you feel ready.",
  "Practice today, shine tomorrow.",
  "Play with heart.",
  "Your stage is waiting.",
];

/** A limb with an upper part and a bending lower part, drawn from its joint at 0,0. */
function Limb({ x, y, length, bendBack, className = "", color }: { x: number; y: number; length: number; bendBack?: boolean; className?: string; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`limb ${className}`} stroke={color} strokeWidth="13" strokeLinecap="round">
        <line x2="0" y2={length} />
        <g transform={`translate(0 ${length})`}>
          {/* Knees bend backwards, elbows forwards. */}
          <g transform={bendBack ? undefined : "scale(-1 1)"}>
            <line className="joint" x2="0" y2={length} />
          </g>
        </g>
      </g>
    </g>
  );
}

export function MotivationReel() {
  const t = useT();
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setLine((i) => (i + 1) % LINES.length), 3200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="reel art-activity relative overflow-hidden rounded-[2rem] text-white shadow-xl" data-paused={paused}>
      <svg viewBox="0 0 400 260" className="block w-full" role="img" aria-label={t("Animation of an athlete running towards a trophy")}>
        {[40, 90, 140].map((y, i) => (
          <line key={y} className="wind" style={{ animationDelay: `${i * -0.37}s` }} x1="0" y1={y} x2={50 + i * 18} y2={y} stroke="white" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        ))}
        <text x="340" y="150" fontSize="54" textAnchor="middle" aria-hidden>🏆</text>
        <rect y="196" width="400" height="64" fill="#b5451f" />
        <line x1="0" y1="198" x2="400" y2="198" stroke="white" strokeWidth="3" />
        <line className="lane" x1="0" y1="226" x2="480" y2="226" stroke="white" strokeWidth="4" strokeDasharray="48 32" />
        <ellipse cx="180" cy="204" rx="46" ry="6" fill="black" opacity="0.25" />
        <g className="runner">
          <Limb x={188} y={82} length={30} className="opposite" color="#e6a817" />
          <Limb x={172} y={128} length={36} bendBack className="opposite" color="#e6a817" />
          <line x1="190" y1="76" x2="172" y2="128" stroke="#f2b21d" strokeWidth="22" strokeLinecap="round" />
          <circle cx="202" cy="48" r="17" fill="#f2b21d" />
          <Limb x={172} y={128} length={36} bendBack color="#ffd45c" />
          <Limb x={188} y={82} length={30} color="#ffd45c" />
        </g>
      </svg>
      <div className="flex items-center justify-between gap-3 bg-brand-dark px-6 py-4">
        <p key={line} className="animate-card-in font-display text-2xl font-bold italic sm:text-3xl">{t(LINES[line])}</p>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} className="shrink-0 cursor-pointer text-sm text-white/70 underline underline-offset-4 hover:text-white motion-reduce:hidden">
          {t(paused ? "Play" : "Pause")}
        </button>
      </div>
    </div>
  );
}
