import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return <StaticPage slug="how-it-works" />;
}
