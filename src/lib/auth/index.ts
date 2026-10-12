import "server-only";
import { cookies } from "next/headers";
import { dataSource, devAuth } from "@/lib/config";
import { getStore } from "@/lib/data";
import type { Profile, Role } from "@/types/domain";

export const DEV_USER_COOKIE = "cf_dev_user";

const DEV_USERS: Array<{ id: string; label: string; role: Role }> = [
  { id: "u-admin", label: "Platform Admin", role: "admin" },
  { id: "u-moderator", label: "Moderator", role: "moderator" },
  { id: "u-reviewer", label: "A Reviewer", role: "user" },
];

export function listDevUsers() {
  return DEV_USERS;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const store = await getStore();

  if (dataSource === "supabase") {
    const { createServerSupabaseClient } = await import("./supabase");
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const existing = await store.getProfile(user.id);
    if (existing) return existing;
    const profile: Profile = {
      id: user.id,
      email: user.email ?? "",
      displayName: (user.user_metadata?.full_name as string) ?? null,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    return store.upsertProfile(profile);
  }

  if (!devAuth) return null;
  const jar = await cookies();
  const userId = jar.get(DEV_USER_COOKIE)?.value;
  if (!userId) return null;
  return store.getProfile(userId);
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(roles: Role[]): Promise<Profile> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export function isStaff(role: Role | undefined): boolean {
  return role === "admin" || role === "moderator";
}
