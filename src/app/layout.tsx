import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n/server";
import { ToastProvider } from "@/components/ui/toast";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DevBanner } from "@/components/layout/dev-banner";
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
            <main className="relative flex-1 overflow-hidden bg-aurora">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -right-24 top-24 h-[520px] w-[520px] rounded-full bg-jade/10 blur-[130px] animate-blob" />
                <div className="absolute -left-24 bottom-24 h-[520px] w-[520px] rounded-full bg-navy-accent/10 blur-[130px] animate-blob delay-3000" />
              </div>
              {children}
            </main>
            <SiteFooter />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
