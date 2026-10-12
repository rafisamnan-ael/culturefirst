import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <StaticPage slug="contact" />;
}
