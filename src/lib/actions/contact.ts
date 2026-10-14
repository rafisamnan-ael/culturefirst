"use server";

import { headers } from "next/headers";
import { getStore } from "@/lib/data";
import { contactSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/reviews";

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

export async function submitContactMessage(input: unknown): Promise<ActionResult> {
  const limited = rateLimit(`contact:${await clientIp()}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "RATE_LIMITED" };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "INVALID_INPUT" };
  }
  const payload = parsed.data;

  const store = await getStore();
  let organizationId: string | null = payload.organizationId?.trim() || null;
  let organizationName = payload.organizationName?.trim() || null;
  if (organizationId) {
    const org =
      (await store.getOrganizationBySlug(organizationId)) ??
      (await store.getOrganizationById(organizationId));
    if (org) {
      organizationId = org.id;
      organizationName = org.bengaliName || org.officialName;
    }
  }

  await store.createContactMessage({
    organizationId,
    organizationName,
    name: payload.name.trim(),
    email: payload.email.trim(),
    topic: payload.topic?.trim() || "general",
    subject: payload.subject?.trim() || null,
    message: payload.message.trim(),
    locale: payload.locale ?? null,
  });

  return { ok: true };
}
