import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "Community guidelines" };

export default function GuidelinesPage() {
  return <StaticPage slug="community-guidelines" />;
}
