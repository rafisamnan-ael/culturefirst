import "server-only";
import { dataSource } from "@/lib/config";
import type { Store } from "@/lib/data/store";
import { FixtureStore } from "@/lib/data/stores/fixture-store";

let cached: Promise<Store> | null = null;

/**
 * Server-side data access factory. In production (DATA_SOURCE=supabase) this
 * returns the Supabase-backed store; in local development it returns the
 * clearly-labelled JSON fixture store.
 */
export function getStore(): Promise<Store> {
  if (!cached) {
    cached = (async () => {
      if (dataSource === "supabase") {
        const { SupabaseStore } = await import("@/lib/data/stores/supabase-store");
        return SupabaseStore.create();
      }
      return FixtureStore.open();
    })();
  }
  return cached;
}

export function resetStoreCache(): void {
  cached = null;
}
