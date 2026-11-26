"use client";

/* eslint-disable @next/next/no-img-element -- uploaded files are local blob URLs */
import { useMediaUrl } from "@/lib/media";

interface PictureProps {
  id: string;
  alt: string;
  icon?: string;
  tone?: "activity" | "talent";
  className?: string;
}

/** Shows an uploaded image, or a branded placeholder when none is selected. */
export function Picture({ id, alt, icon = "🏆", tone = "activity", className = "" }: PictureProps) {
  const url = useMediaUrl(id);
  if (url) return <img src={url} alt={alt} className={`object-cover ${className}`} />;
  return (
    <div role="img" aria-label={alt} className={`@container-size flex items-center justify-center overflow-hidden ${tone === "talent" ? "art-talent" : "art-activity"} ${className}`}>
      <span aria-hidden className="text-[55cqmin] leading-none drop-shadow-[0_8px_12px_rgba(0,0,0,.35)]">{icon}</span>
    </div>
  );
}

export function Video({ id, loop = false, className = "" }: { id: string; loop?: boolean; className?: string }) {
  const url = useMediaUrl(id);
  if (!url) return <div className={`bg-zinc-900 ${className}`} />;
  return <video src={url} controls loop={loop} autoPlay={loop} muted={loop} playsInline preload="metadata" className={`bg-black ${className}`} />;
}
