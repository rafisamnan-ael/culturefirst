import { cookies } from "next/headers";
import { translate, type Locale } from "./dictionary";

export const LOCALE_COOKIE = "cf_locale";

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "bn" ? "bn" : "en";
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getServerT() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) =>
      translate(key, locale, vars),
  };
}
