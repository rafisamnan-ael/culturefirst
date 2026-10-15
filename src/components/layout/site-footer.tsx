"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { brand } from "@/lib/config";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.platform"),
      links: [
        { href: "/organizations", label: t("nav.directory") },
        { href: "/categories", label: t("nav.categories") },
        { href: "/how-it-works", label: t("nav.howItWorks") },
        { href: "/methodology", label: t("nav.methodology") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "/contact", label: t("nav.contact") },
        { href: "/community-guidelines", label: t("footer.guidelines") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms", label: t("footer.terms") },
      ],
    },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-gradient-navy text-soft">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-jade/15 blur-[100px] animate-blob" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-[100px] animate-blob delay-2000" />
      </div>
      <div className="container relative grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-jade-highlight ring-1 ring-gold/30">
              C
            </span>
            <span className="text-lg font-semibold text-white">{brand.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-soft/70">{t("footer.tagline")}</p>
          <p className="mt-2 text-xs text-soft/50" lang={locale === "bn" ? "bn" : undefined}>
            {brand.tagline}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-soft/50">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-soft/70 transition-colors hover:text-jade-highlight">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-soft/50 sm:flex-row">
          <p>
            © {year} {brand.name}. {t("footer.rights")}
          </p>
          <p>{brand.country} · Asia/Dhaka</p>
        </div>
      </div>
    </footer>
  );
}
