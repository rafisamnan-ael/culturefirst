"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/toast";
import { moderationAction, resolveReport, setAppealStatusAction, setClaimStatusAction, setContactMessageStatusAction } from "@/lib/actions/admin";

export function ModerationButtons({ reviewId }: { reviewId: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<null | "reject" | "return">(null);
  const [reason, setReason] = useState("");

  async function run(action: "approve" | "reject" | "return", r?: string) {
    setBusy(true);
    const res = await moderationAction({ reviewId, action, reason: r });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: `Review ${action}d` });
      setDialog(null);
      setReason("");
      router.refresh();
    } else {
      toast({ kind: "error", title: t("common.error"), description: res.error });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="accent" disabled={busy} onClick={() => run("approve")}>
        <Check className="h-3.5 w-3.5" />
        {t("admin.approve")}
      </Button>
      <Button size="sm" variant="destructive" disabled={busy} onClick={() => setDialog("reject")}>
        <X className="h-3.5 w-3.5" />
        {t("admin.reject")}
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => setDialog("return")}>
        <RotateCcw className="h-3.5 w-3.5" />
        {t("admin.return")}
      </Button>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "reject" ? t("admin.reject") : t("admin.return")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("admin.reason")}
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-end">
              <Button
                variant={dialog === "reject" ? "destructive" : "default"}
                disabled={busy || !reason.trim()}
                onClick={() => dialog && run(dialog, reason)}
              >
                {t("common.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(status: "resolved" | "dismissed") {
    setBusy(true);
    const res = await resolveReport({ id, status });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: `Report ${status}` });
      router.refresh();
    }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={() => run("resolved")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => run("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}

export function AppealActions({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(status: "accepted" | "rejected") {
    setBusy(true);
    const res = await setAppealStatusAction({ id, status });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: `Appeal ${status}` });
      router.refresh();
    }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="accent" disabled={busy} onClick={() => run("accepted")}>
        Accept
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => run("rejected")}>
        Reject
      </Button>
    </div>
  );
}

export function ClaimActions({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(status: "approved" | "rejected") {
    setBusy(true);
    const res = await setClaimStatusAction({ id, status });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: `Claim ${status}` });
      router.refresh();
    }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="accent" disabled={busy} onClick={() => run("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" disabled={busy} onClick={() => run("rejected")}>
        Reject
      </Button>
    </div>
  );
}

export function MessageActions({ id, status }: { id: string; status: "open" | "resolved" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(next: "open" | "resolved") {
    setBusy(true);
    const res = await setContactMessageStatusAction({ id, status: next });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: `Message marked ${next}` });
      router.refresh();
    }
  }
  return status === "open" ? (
    <Button size="sm" variant="accent" disabled={busy} onClick={() => run("resolved")}>
      Mark resolved
    </Button>
  ) : (
    <Button size="sm" variant="outline" disabled={busy} onClick={() => run("open")}>
      Reopen
    </Button>
  );
}
