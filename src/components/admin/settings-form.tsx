"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { updateSettingsAction } from "@/lib/actions/admin";
import type { PlatformSettings } from "@/types/domain";

export function SettingsForm({ initial }: { initial: PlatformSettings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(initial);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await updateSettingsAction({
      brandName: settings.brandName,
      tagline: settings.tagline,
      methodologyPublic: settings.methodologyPublic,
      minProvisionalReviews: settings.minProvisionalReviews,
      minPublishedReviews: settings.minPublishedReviews,
      minAnsweredParameters: settings.minAnsweredParameters,
      minWeightCoverage: settings.minWeightCoverage,
      maintenanceMessage: settings.maintenanceMessage,
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Settings saved" });
      router.refresh();
    } else toast({ kind: "error", title: res.error });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="brandName">Brand name</Label>
              <Input id="brandName" value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="methodologyPublic">Methodology (public)</Label>
            <Textarea
              id="methodologyPublic"
              value={settings.methodologyPublic}
              onChange={(e) => setSettings({ ...settings, methodologyPublic: e.target.value })}
              rows={5}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="minProv">Min provisional reviews</Label>
              <Input
                id="minProv"
                type="number"
                min={1}
                value={settings.minProvisionalReviews}
                onChange={(e) => setSettings({ ...settings, minProvisionalReviews: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minPub">Min published reviews</Label>
              <Input
                id="minPub"
                type="number"
                min={1}
                value={settings.minPublishedReviews}
                onChange={(e) => setSettings({ ...settings, minPublishedReviews: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minAns">Min answered parameters</Label>
              <Input
                id="minAns"
                type="number"
                min={1}
                value={settings.minAnsweredParameters}
                onChange={(e) => setSettings({ ...settings, minAnsweredParameters: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minWeight">Min weight coverage (0–1)</Label>
              <Input
                id="minWeight"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={settings.minWeightCoverage}
                onChange={(e) => setSettings({ ...settings, minWeightCoverage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="maintenance">Maintenance message (optional)</Label>
            <Input
              id="maintenance"
              value={settings.maintenanceMessage ?? ""}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value || null })}
              placeholder="Leave empty for normal operation"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
