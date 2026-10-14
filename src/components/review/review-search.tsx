"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, PenLine, Building2, Flame, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

interface OrgOption {
  id: string;
  slug: string;
  officialName: string;
  bengaliName: string | null;
}

export function ReviewSearch({
  organizations,
  className,
  placeholder,
}: {
  organizations: OrgOption[];
  className?: string;
  placeholder?: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? organizations
        .filter((org) => {
          const q = query.toLowerCase();
          return (
            org.officialName.toLowerCase().includes(q) ||
            (org.bengaliName && org.bengaliName.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : organizations.slice(0, 5); // popular/featured fallback when focused with empty query

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            placeholder ||
            (locale === "bn"
              ? "রেটিং দিতে প্রতিষ্ঠানের নাম লিখুন (যেমন: BRAC, গ্রামীণফোন, ঢাবি)…"
              : "Search an organization to review (e.g. BRAC, Grameenphone, DU)…")
          }
          className="h-14 w-full rounded-2xl border-2 border-border/80 bg-white pl-12 pr-4 text-base text-charcoal shadow-soft transition-all focus-visible:border-jade focus-visible:ring-4 focus-visible:ring-jade/15 placeholder:text-muted-foreground/70"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-elevated animate-in fade-in slide-in-from-top-2 duration-200">
          {!query.trim() && (
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/50 mb-1">
              <Flame className="h-3.5 w-3.5 text-gold" />
              <span>{locale === "bn" ? "জনপ্রিয় প্রতিষ্ঠানসমূহ" : "Popular organizations to review"}</span>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="divide-y divide-border/30">
              {filtered.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/organizations/${org.slug}/review`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition hover:bg-jade-highlight group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warmgray text-muted-foreground group-hover:bg-jade group-hover:text-white transition-colors">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-charcoal group-hover:text-navy">
                        {org.officialName}
                      </p>
                      {org.bengaliName && (
                        <p className="truncate text-xs text-muted-foreground" lang="bn">
                          {org.bengaliName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-jade bg-white px-2.5 py-1 rounded-full border border-jade/20 shadow-xs group-hover:bg-jade group-hover:text-white transition-all">
                    <PenLine className="h-3.5 w-3.5" />
                    {t("nav.writeReview")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-charcoal">
                {locale === "bn" ? "কোনো প্রতিষ্ঠান পাওয়া যায়নি।" : "No organizations found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {locale === "bn"
                  ? "সঠিক নাম লিখেছেন কি না তা যাচাই করুন।"
                  : "Check the spelling or try searching by city or abbreviation."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
