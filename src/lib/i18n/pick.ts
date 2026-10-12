import type { Bilingual } from "@/types/domain";
import type { Locale } from "@/lib/i18n/dictionary";

export function pick(value: Bilingual | undefined | null, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.en || "";
}
