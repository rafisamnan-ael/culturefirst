import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n/server";
import { ToastProvider } from "@/components/ui/toast";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DevBanner } from "@/components/layout/dev-banner";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import { getCurrentUser, listDevUsers } from "@/lib/auth";
import { brand, siteUrl } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    siteName: brand.name,
    locale: "en_BD",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10283F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  const devUsers = listDevUsers().map((u) => ({ id: u.id, label: u.label, role: u.role }));

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider initialLocale={locale}>
          <ToastProvider>
            <DevBanner />
            <SiteHeader
              brandName={brand.name}
              user={user ? { id: user.id, displayName: user.displayName, role: user.role } : null}
              devUsers={devUsers}
            />
            <main className="relative flex-1 overflow-hidden bg-aurora bg-aurora-drift">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="orb left-[-6rem] top-20 h-[520px] w-[520px] bg-jade/25 animate-orb-drift" />
                <div className="orb right-[-6rem] top-1/3 h-[540px] w-[540px] bg-navy-accent/30 animate-orb-drift delay-2000" />
                <div className="orb bottom-10 left-1/3 h-[440px] w-[440px] bg-gold/20 animate-orb-drift delay-4000" />
                <div className="orb bottom-[-6rem] left-[-4rem] h-[480px] w-[480px] bg-jade-deep/20 animate-orb-drift delay-3000" />
              </div>
              <ScrollReveal />
              {children}
            </main>
            <SiteFooter />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
