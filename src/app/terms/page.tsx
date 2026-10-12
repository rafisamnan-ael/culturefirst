import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return <StaticPage slug="terms" />;
}
