import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <StaticPage slug="about" />;
}
