"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n/provider";
import { submitContactMessage } from "@/lib/actions/contact";

const TOPICS = ["general", "incorrect-info", "missing-website", "claim", "privacy", "legal", "bug", "other"] as const;

export function ContactForm({
  defaultTopic,
  defaultOrgId,
  defaultOrgName,
}: {
  defaultTopic?: string;
  defaultOrgId?: string;
  defaultOrgName?: string;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: defaultTopic && TOPICS.includes(defaultTopic as (typeof TOPICS)[number]) ? defaultTopic : "general",
    subject: "",
    message: "",
    organizationName: defaultOrgName ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await submitContactMessage({
      ...form,
      organizationId: defaultOrgId,
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
    } else {
      const messages: Record<string, string> = {
        RATE_LIMITED: "You have sent too many messages recently. Please try again later.",
        INVALID_INPUT: "Please check the form and try again.",
      };
      toast({ kind: "error", title: messages[res.error] ?? res.error });
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <p className="text-base font-semibold text-charcoal">{t("contact.success")}</p>
          <p className="text-sm text-muted-foreground">{t("contact.successBody")}</p>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href="/">{t("nav.directory")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {defaultOrgId && defaultOrgName && (
            <div className="rounded-md border border-border bg-warmgray/60 p-3 text-sm">
              <span className="text-muted-foreground">{t("contact.aboutOrg")}: </span>
              <span className="font-medium text-charcoal">{defaultOrgName}</span>
              <input type="hidden" name="organizationId" value={defaultOrgId} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="contact-name">{t("contact.name")} *</Label>
              <Input
                id="contact-name"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-email">{t("contact.email")} *</Label>
              <Input
                id="contact-email"
                type="email"
                required
                maxLength={200}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {!defaultOrgId && (
            <div className="space-y-1">
              <Label htmlFor="contact-org">{t("contact.aboutOrg")}</Label>
              <Input
                id="contact-org"
                maxLength={200}
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder={t("contact.orgHelp")}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="contact-topic">{t("contact.topic")} *</Label>
            <Select
              id="contact-topic"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {t(`contact.topic.${topic}`)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contact-subject">{t("contact.subject")}</Label>
            <Input
              id="contact-subject"
              maxLength={200}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contact-message">{t("contact.message")} *</Label>
            <Textarea
              id="contact-message"
              required
              rows={6}
              maxLength={3000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? t("contact.sending") : t("contact.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
