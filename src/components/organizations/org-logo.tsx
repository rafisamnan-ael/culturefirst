"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_MAP: Record<string, string> = {
  // Big BD brands - confident logos, otherwise fallback is cleaner than uncertain logos
  grameenphone: "/logos/grameenphone.svg",
  "robi-axiata": "/logos/robi.svg",
  banglalink: "/logos/banglalink.svg",
  bkash: "/logos/bkash.svg",
  nagad: "/logos/nagad.svg",
  pathao: "/logos/pathao.svg",
  // Banks
  "brac-bank": "/logos/brac-bank.svg",
  "dutch-bangla-bank": "/logos/dutch-bangla.svg",
  "islami-bank-bangladesh": "/logos/islami-bank.svg",
  "prime-bank": "/logos/prime-bank.svg",
  "city-bank-bangladesh": "/logos/city-bank.svg",
  "eastern-bank-bangladesh": "/logos/ebl.svg",
  "standard-chartered-bangladesh": "/logos/standard-chartered.svg",
  // Hospitals
  "square-hospital": "/logos/square-hospital.svg",
  // Universities
  "university-of-dhaka": "/logos/du.svg",
  buet: "/logos/buet.svg",
  "brac-university": "/logos/bracu.svg",
  // Add local assets only when you are sure about trademark/accuracy. Placeholder paths are safe to 404->fallback.
};

const GRADIENTS = [
  "from-navy via-[#14354f] to-[#0d2031]",
  "from-[#14354f] via-navy-secondary to-navy",
  "from-navy via-jade to-navy-secondary",
  "from-[#0f2a3a] via-navy to-[#1b4660]",
];

function pickGradient(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function OrgLogo({ slug, name }: { slug: string; name: string }) {
  const src = LOGO_MAP[slug];
  const [failed, setFailed] = useState(false);
  const initial = (name?.trim().slice(0, 1) ?? "?").toUpperCase();
  const gradient = pickGradient(slug);

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-bold text-white shadow-card ring-1 ring-white/10",
          gradient
        )}
      >
        <span className="drop-shadow-sm">{initial}</span>
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="h-full w-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
