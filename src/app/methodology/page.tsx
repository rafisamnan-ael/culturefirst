import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How CultureFirst calculates weighted culture scores and handles sample sizes.",
};

export default function MethodologyPage() {
  return <StaticPage slug="methodology" showThresholds />;
}
