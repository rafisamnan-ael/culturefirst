"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createOrganizationAction, updateOrganizationAction } from "@/lib/actions/admin";
import type { Organization, OrganizationCategory } from "@/types/domain";

export function CreateOrganizationForm({ categories }: { categories: OrganizationCategory[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await createOrganizationAction({
      officialName: String(fd.get("officialName") || ""),
      bengaliName: String(fd.get("bengaliName") || ""),
      categoryId: String(fd.get("categoryId") || ""),
      division: String(fd.get("division") || ""),
      district: String(fd.get("district") || ""),
      city: String(fd.get("city") || ""),
      website: String(fd.get("website") || ""),
      googleMapsUrl: String(fd.get("googleMapsUrl") || ""),
      descriptionEn: String(fd.get("descriptionEn") || ""),
      descriptionBn: String(fd.get("descriptionBn") || ""),
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Organization created" });
      setOpen(false);
      router.refresh();
    } else {
      toast({ kind: "error", title: res.error });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add organization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="officialName">Official name *</Label>
              <Input id="officialName" name="officialName" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bengaliName">Bengali name</Label>
              <Input id="bengaliName" name="bengaliName" lang="bn" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="categoryId">Category *</Label>
            <Select id="categoryId" name="categoryId" required defaultValue={categories[0]?.id}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="division" placeholder="Division" />
            <Input name="district" placeholder="District" />
            <Input name="city" placeholder="City" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="website" placeholder="https://…" />
            <Input name="googleMapsUrl" placeholder="Google Maps URL" />
          </div>
          <Textarea name="descriptionEn" placeholder="Description (English)" rows={2} />
          <Textarea name="descriptionBn" placeholder="Description (বাংলা)" rows={2} lang="bn" />
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditOrganizationDialog({
  organization,
  categories,
}: {
  organization: Organization;
  categories: OrganizationCategory[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await updateOrganizationAction({
      id: organization.id,
      patch: {
        officialName: String(fd.get("officialName") || organization.officialName),
        bengaliName: (String(fd.get("bengaliName") || "") || null) as string | null,
        categoryId: String(fd.get("categoryId") || organization.categoryId),
        division: (String(fd.get("division") || "") || null) as string | null,
        district: (String(fd.get("district") || "") || null) as string | null,
        city: (String(fd.get("city") || "") || null) as string | null,
        website: (String(fd.get("website") || "") || null) as string | null,
        googleMapsUrl: (String(fd.get("googleMapsUrl") || "") || null) as string | null,
        status: String(fd.get("status") || organization.status) as Organization["status"],
      },
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Saved" });
      setOpen(false);
      router.refresh();
    } else {
      toast({ kind: "error", title: res.error });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`name-${organization.id}`}>Official name</Label>
              <Input id={`name-${organization.id}`} name="officialName" defaultValue={organization.officialName} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`bn-${organization.id}`}>Bengali name</Label>
              <Input id={`bn-${organization.id}`} name="bengaliName" defaultValue={organization.bengaliName ?? ""} lang="bn" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name="categoryId" defaultValue={organization.categoryId} aria-label="Category">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={organization.status} aria-label="Status">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="pending_approval">pending_approval</option>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="division" defaultValue={organization.division ?? ""} placeholder="Division" />
            <Input name="district" defaultValue={organization.district ?? ""} placeholder="District" />
            <Input name="city" defaultValue={organization.city ?? ""} placeholder="City" />
          </div>
          <Input name="website" defaultValue={organization.website ?? ""} placeholder="https://…" />
          <Input name="googleMapsUrl" defaultValue={organization.googleMapsUrl ?? ""} placeholder="Google Maps URL" />
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
