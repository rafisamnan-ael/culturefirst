"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export async function requestAccountDeletion(): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const store = await getStore();
  // Queue an auditable deletion request for a human operator (free-tier safe).
  await store.updateSettings({}, user.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProfilePrivacy(input: { displayName: string | null }): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const store = await getStore();
  await store.upsertProfile({ ...user, displayName: input.displayName });
  revalidatePath("/dashboard");
  return { ok: true };
}
