"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { requestClaim } from "@/lib/actions/reviews";

export function ClaimForm({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ representativeName: "", position: "", evidence: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await requestClaim({
      organizationId,
      representativeName: form.representativeName,
      position: form.position,
      evidence: form.evidence,
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Claim request submitted" });
      router.push(`/organizations/${organizationName}`);
    } else {
      toast({ kind: "error", title: res.error });
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="representativeName">Your name *</Label>
            <Input
              id="representativeName"
              required
              value={form.representativeName}
              onChange={(e) => setForm({ ...form, representativeName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="evidence">Evidence of affiliation *</Label>
            <Textarea
              id="evidence"
              required
              rows={4}
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              placeholder="Describe your role and include a verifiable contact or reference (will be checked by an administrator)."
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              Administrators will verify your claim before you are added as a representative. You will not be able to
              delete or alter reviews, change scores, or identify reviewers.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit claim"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
