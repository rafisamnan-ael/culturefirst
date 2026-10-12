"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/toast";
import { withdrawReview, appealReview } from "@/lib/actions/reviews";
import { requestAccountDeletion, updateProfilePrivacy } from "@/lib/actions/account";
import type { Review } from "@/types/domain";

export function ReviewActions({ review }: { review: Review }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [appealOpen, setAppealOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleWithdraw() {
    setBusy(true);
    const res = await withdrawReview(review.id);
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: t("status.withdrawn") });
      router.refresh();
    } else {
      toast({ kind: "error", title: res.error });
    }
  }

  async function handleAppeal() {
    setBusy(true);
    const res = await appealReview({ reviewId: review.id, message });
    setBusy(false);
    if (res.ok) {
      setAppealOpen(false);
      toast({ kind: "success", title: t("status.under_appeal") });
      router.refresh();
    } else {
      toast({ kind: "error", title: res.error });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(review.status === "pending" || review.status === "published") && (
        <Button variant="outline" size="sm" onClick={handleWithdraw} disabled={busy}>
          {t("dashboard.withdraw")}
        </Button>
      )}
      {review.status === "rejected" && (
        <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("dashboard.appeal")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.appeal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {review.moderationReason && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {t("admin.reason")}: {review.moderationReason}
                </p>
              )}
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={1000} />
              <div className="flex justify-end">
                <Button onClick={handleAppeal} disabled={busy || message.trim().length < 10}>
                  {t("common.submit")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function PrivacySettings({ initialName }: { initialName: string | null }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await updateProfilePrivacy({ displayName: name || null });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: t("common.save") });
      router.refresh();
    }
  }

  async function deleteAccount() {
    setBusy(true);
    await requestAccountDeletion();
    setBusy(false);
    toast({ kind: "info", title: "Deletion request recorded", description: "An administrator will process it." });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("review.displayNameLabel")}</Label>
        <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={busy}>
          {t("common.save")}
        </Button>
        <Button size="sm" variant="outline" onClick={deleteAccount} disabled={busy}>
          {t("dashboard.deleteAccount")}
        </Button>
      </div>
    </div>
  );
}
