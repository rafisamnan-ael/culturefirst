import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <StaticPage slug="privacy" />;
}
