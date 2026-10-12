"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dataSource, devAuth } from "@/lib/config";
import { DEV_USER_COOKIE } from "@/lib/auth";

export async function devSignIn(formData: FormData): Promise<void> {
  if (!devAuth || dataSource !== "fixtures") return;
  const userId = String(formData.get("userId") || "u-reviewer");
  const jar = await cookies();
  jar.set(DEV_USER_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");
  redirect(redirectTo);
}

export async function devSignOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(DEV_USER_COOKIE);
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  if (dataSource === "supabase") {
    const { createServerSupabaseClient } = await import("./supabase");
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  await devSignOut();
}
