"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { submitSuggestion } from "@/lib/actions/reviews";
import type { OrganizationCategory } from "@/types/domain";

export function SuggestOrganizationForm({ categories }: { categories: OrganizationCategory[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    suggestedName: "",
    suggestedBengaliName: "",
    categoryId: "",
    division: "",
    district: "",
    city: "",
    website: "",
    address: "",
    reason: "",
  });

  const categoriesSorted = useMemo(() => [...categories].sort((a, b) => a.name.en.localeCompare(b.name.en)), [categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.suggestedName.trim() || !form.categoryId) {
      toast({ title: "Missing information", description: "Please enter the organization name and choose a category.", kind: "error" });
      return;
    }
    setBusy(true);
    const result = await submitSuggestion({
      suggestedName: form.suggestedName.trim(),
      suggestedBengaliName: form.suggestedBengaliName.trim() || undefined,
      categoryId: form.categoryId,
      division: form.division.trim() || undefined,
      district: form.district.trim() || undefined,
      city: form.city.trim() || undefined,
      website: form.website.trim() || undefined,
      address: form.address.trim() || undefined,
      reason: form.reason.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast({ title: "Could not submit", description: result.error, kind: "error" });
      return;
    }
    toast({ title: "Suggestion received", description: "Your suggestion will be reviewed by an administrator before it appears publicly. Thank you!", kind: "success" });
    router.push("/organizations");
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <p className="rounded-md border border-gold/40 bg-gold/10 p-3 text-sm text-[#7a5f2e]">
          Manual additions require administrator review. Approved suggestions become public listings with no fabricated review scores.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="suggestedName">Organization name *</Label>
              <Input id="suggestedName" value={form.suggestedName} onChange={(e) => setForm((s) => ({ ...s, suggestedName: e.target.value }))} placeholder="Example: Acme Hospital" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suggestedBengaliName">Bengali name</Label>
              <Input id="suggestedBengaliName" value={form.suggestedBengaliName} onChange={(e) => setForm((s) => ({ ...s, suggestedBengaliName: e.target.value }))} placeholder="আকমি হাসপাতাল" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
              required
            >
              <option value="">Choose a category</option>
              {categoriesSorted.map((c) => (
                <option key={c.id} value={c.id}>{c.name.en}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Input id="division" value={form.division} onChange={(e) => setForm((s) => ({ ...s, division: e.target.value }))} placeholder="Dhaka" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={form.district} onChange={(e) => setForm((s) => ({ ...s, district: e.target.value }))} placeholder="Dhaka" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} placeholder="Dhaka" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (if any)</Label>
            <Input id="website" value={form.website} onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))} placeholder="https://example.com.bd" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} placeholder="Road, area, city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Why should we add it? (optional)</Label>
            <Textarea id="reason" value={form.reason} onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))} rows={3} placeholder="Provide any detail that helps verification." />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/organizations")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
