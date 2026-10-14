"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, PenLine, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { pick } from "@/lib/i18n/pick";

interface OrgOption {
  id: string;
  slug: string;
  officialName: string;
  bengaliName: string | null;
}

export function ReviewSearch({
  organizations,
}: {
  organizations: OrgOption[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query.trim()
    ? organizations
        .filter((org) => {
          const q = query.toLowerCase();
          return (
            org.officialName.toLowerCase().includes(q) ||
            (org.bengaliName && org.bengaliName.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={locale === "bn" ? "রিভিউ লিখতে প্রতিষ্ঠানের নাম লিখুন..." : "Type organization name to review..."}
          className="h-12 border-2 border-border/80 bg-white pl-11 pr-4 text-sm text-charcoal shadow-sm transition focus-visible:border-jade focus-visible:ring-jade/20"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-elevated">
          {filtered.length > 0 ? (
            <div className="divide-y divide-border/40">
              {filtered.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/organizations/${org.slug}/review`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left transition hover:bg-jade-highlight"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-warmgray text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{org.officialName}</p>
                      {org.bengaliName && (
                        <p className="text-xs text-muted-foreground" lang="bn">
                          {org.bengaliName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-jade">
                    <PenLine className="h-3.5 w-3.5" />
                    {t("nav.writeReview")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {locale === "bn" ? "কোনো প্রতিষ্ঠান পাওয়া যায়নি।" : "No organizations found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
