"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { approveSuggestion, rejectSuggestion } from "@/lib/actions/admin";

export function SuggestionActions({ id }: { id: string }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setBusy("approve");
    const result = await approveSuggestion({ id });
    setBusy(null);
    if (!result.ok) {
      toast({ title: "Could not approve", description: result.error, kind: "error" });
      return;
    }
    toast({ title: "Suggestion approved", description: "A new organization was created.", kind: "success" });
  }

  async function handleReject() {
    setBusy("reject");
    const result = await rejectSuggestion({ id, reason: reason.trim() || undefined });
    setBusy(null);
    if (!result.ok) {
      toast({ title: "Could not reject", description: result.error, kind: "error" });
      return;
    }
    toast({ title: "Suggestion rejected", kind: "info" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={handleApprove} disabled={busy !== null}>{busy === "approve" ? "Approving…" : "Approve"}</Button>
      <div className="flex items-center gap-2">
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="h-8 w-56" />
        <Button size="sm" variant="outline" onClick={handleReject} disabled={busy !== null}>{busy === "reject" ? "Rejecting…" : "Reject"}</Button>
      </div>
    </div>
  );
}
