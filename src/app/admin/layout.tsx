import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard, Building2, Tags, FileSliders, ShieldAlert, ShieldCheck, BadgeCheck, Settings, ClipboardList, Mail, Gauge } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getServerT } from "@/lib/i18n/server";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", key: "admin.dashboard", icon: LayoutDashboard },
  { href: "/admin/moderation", key: "admin.moderation", icon: ShieldAlert },
  { href: "/admin/organizations", key: "admin.organizations", icon: Building2 },
  { href: "/admin/suggestions", key: "admin.suggestions", icon: ClipboardList },
  { href: "/admin/categories", key: "admin.categories", icon: Tags },
  { href: "/admin/templates", key: "admin.templates", icon: FileSliders },
  { href: "/admin/claims", key: "admin.claims", icon: BadgeCheck },
  { href: "/admin/messages", key: "admin.messages", icon: Mail },
  { href: "/admin/quality", key: "admin.quality", icon: Gauge },
  { href: "/admin/settings", key: "admin.settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) redirect("/login");
  const { t } = await getServerT();

  return (
    <div>
      <PageHero
        eyebrow={t("admin.title")}
        icon={ShieldCheck}
        title={t("admin.title")}
        subtitle={user.displayName || user.email}
        size="compact"
      />
      <div className="container grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-white to-jade-highlight/40 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("admin.title")}</p>
            <p className="mt-1 text-sm font-medium text-charcoal">{user.displayName || user.email}</p>
            <p className="text-xs font-semibold capitalize text-jade">{user.role}</p>
          </div>
          <nav className="flex flex-wrap gap-1 lg:flex-col" aria-label="Admin">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-charcoal/80 transition-all hover:translate-x-0.5 hover:bg-jade-highlight/60 hover:text-navy"
              >
                <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-jade" />
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 animate-fade-up">{children}</div>
      </div>
    </div>
  );
}
