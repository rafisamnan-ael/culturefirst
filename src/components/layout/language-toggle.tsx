"use client";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={cn("inline-flex overflow-hidden rounded-md border border-border text-xs", className)}
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "px-2.5 py-1.5 font-medium transition-colors",
          locale === "en" ? "bg-navy text-soft" : "bg-white text-charcoal hover:bg-warmgray",
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("bn")}
        aria-pressed={locale === "bn"}
        className={cn(
          "px-2.5 py-1.5 font-medium transition-colors",
          locale === "bn" ? "bg-navy text-soft" : "bg-white text-charcoal hover:bg-warmgray",
        )}
        lang="bn"
      >
        বাংলা
      </button>
    </div>
  );
}
