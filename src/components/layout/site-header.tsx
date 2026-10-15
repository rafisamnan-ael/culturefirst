"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, PenLine, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useI18n } from "@/lib/i18n/provider";
import { signOutAction, devSignIn } from "@/lib/auth/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface HeaderUser {
  id: string;
  displayName: string | null;
  role: string;
}

export interface DevUser {
  id: string;
  label: string;
  role: string;
}

const NAV = [
  { href: "/organizations", key: "nav.directory" },
  { href: "/categories", key: "nav.categories" },
  { href: "/how-it-works", key: "nav.howItWorks" },
  { href: "/methodology", key: "nav.methodology" },
  { href: "/about", key: "nav.about" },
];

export function SiteHeader({
  brandName,
  user,
  devUsers,
}: {
  brandName: string;
  user: HeaderUser | null;
  devUsers: DevUser[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const isStaff = user?.role === "admin" || user?.role === "moderator";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-soft/80 shadow-[0_1px_20px_-12px_rgba(16,40,63,0.35)] backdrop-blur-xl">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-navy text-sm font-bold text-soft shadow-soft ring-1 ring-gold/30 transition-transform duration-300 group-hover:scale-105">
              C
            </span>
            <span className="text-gradient-navy text-lg font-semibold tracking-tight">{brandName}</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium text-charcoal/80 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-jade after:transition-all after:duration-300 hover:text-jade hover:after:w-full"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="accent" size="sm" className="shine-sweep font-semibold shadow-soft transition-shadow hover:shadow-glow">
            <Link href="/review" className="flex items-center gap-1.5">
              <PenLine className="h-4 w-4" />
              <span>{t("nav.writeReview")}</span>
            </Link>
          </Button>

          <LanguageToggle className="hidden sm:inline-flex" />
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              {isStaff && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">
                    <ShieldCheck className="h-4 w-4" />
                    {t("nav.admin")}
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <UserCircle2 className="h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  {t("nav.logout")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{brandName}</DialogTitle>
              </DialogHeader>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                <Link
                  href="/review"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md bg-jade-highlight px-3 py-2.5 text-sm font-semibold text-navy hover:bg-jade-highlight/80 mb-2"
                >
                  <PenLine className="h-4 w-4 text-jade" />
                  {t("nav.writeReview")}
                </Link>
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-charcoal hover:bg-warmgray"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {user ? (
                  <>
                    {isStaff && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-warmgray">
                        {t("nav.admin")}
                      </Link>
                    )}
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-warmgray">
                      {t("nav.dashboard")}
                    </Link>
                    <form action={signOutAction}>
                      <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-warmgray">
                        {t("nav.logout")}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-warmgray">
                      {t("nav.login")}
                    </Link>
                  </>
                )}
              </nav>
              <div className="mt-4 flex flex-col gap-3">
                <LanguageToggle />
                {devUsers.length > 0 && (
                  <div className="rounded-md border border-dashed border-gold/60 bg-gold/10 p-3">
                    <p className="mb-2 text-xs font-semibold text-[#7a5f2e]">
                      Development sign-in (fixtures mode)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {devUsers.map((du) => (
                        <form action={devSignIn} key={du.id}>
                          <input type="hidden" name="userId" value={du.id} />
                          <input type="hidden" name="redirectTo" value="/dashboard" />
                          <Button type="submit" variant="outline" size="sm">
                            {du.label}
                          </Button>
                        </form>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
