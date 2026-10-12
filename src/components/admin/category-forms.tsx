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
import {
  createCategoryAction,
  updateCategoryAction,
  setCategoryRelationshipsAction,
  createRelationshipAction,
} from "@/lib/actions/admin";
import type { OrganizationCategory, ReviewerKind, ReviewerRelationshipType } from "@/types/domain";

export function CreateCategoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await createCategoryAction({
      name: { en: String(fd.get("nameEn") || ""), bn: String(fd.get("nameBn") || "") },
      description: { en: String(fd.get("descEn") || ""), bn: String(fd.get("descBn") || "") },
      icon: String(fd.get("icon") || "building"),
      isFallback: fd.get("isFallback") === "on",
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Category created" });
      setOpen(false);
      router.refresh();
    } else toast({ kind: "error", title: res.error });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="nameEn" placeholder="Name (English)" required />
            <Input name="nameBn" placeholder="নাম (বাংলা)" lang="bn" />
          </div>
          <Textarea name="descEn" placeholder="Description (English)" rows={3} />
          <Textarea name="descBn" placeholder="বর্ণনা (বাংলা)" rows={3} lang="bn" />
          <Select name="icon" aria-label="Icon">
            <option value="building">building</option>
            <option value="hospital">hospital</option>
            <option value="graduation">graduation</option>
            <option value="landmark">landmark</option>
            <option value="heart-handshake">heart-handshake</option>
            <option value="school">school</option>
            <option value="banknote">banknote</option>
            <option value="store">store</option>
            <option value="circle-help">circle-help</option>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFallback" /> Fallback category
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryEditor({
  category,
  allRelationships,
  selectedRelationshipIds,
}: {
  category: OrganizationCategory;
  allRelationships: ReviewerRelationshipType[];
  selectedRelationshipIds: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedRelationshipIds);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res1 = await updateCategoryAction({
      id: category.id,
      patch: {
        name: { en: String(fd.get("nameEn") || category.name.en), bn: String(fd.get("nameBn") || category.name.bn) },
        description: {
          en: String(fd.get("descEn") || category.description.en),
          bn: String(fd.get("descBn") || category.description.bn),
        },
      },
    });
    const res2 = await setCategoryRelationshipsAction({
      categoryId: category.id,
      relationshipTypeIds: selected,
    });
    setBusy(false);
    if (res1.ok && res2.ok) {
      toast({ kind: "success", title: "Saved" });
      setOpen(false);
      router.refresh();
    } else toast({ kind: "error", title: "Save failed" });
  }

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{category.name.en}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="nameEn" defaultValue={category.name.en} placeholder="Name (English)" />
            <Input name="nameBn" defaultValue={category.name.bn} placeholder="নাম (বাংলা)" lang="bn" />
          </div>
          <Textarea name="descEn" defaultValue={category.description.en} rows={2} />
          <Textarea name="descBn" defaultValue={category.description.bn} rows={2} lang="bn" />
          <div>
            <p className="mb-2 text-sm font-medium text-charcoal">Applicable reviewer relationships</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {allRelationships.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    className="h-4 w-4 rounded border-border text-jade"
                  />
                  {r.name.en}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateRelationshipForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await createRelationshipAction({
      slug: String(fd.get("slug") || ""),
      name: { en: String(fd.get("nameEn") || ""), bn: String(fd.get("nameBn") || "") },
      kind: String(fd.get("kind") || "other") as ReviewerKind,
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Relationship added" });
      setOpen(false);
      router.refresh();
    } else toast({ kind: "error", title: res.error });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          New relationship
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New reviewer relationship</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input name="slug" placeholder="slug (e.g. supplier)" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="nameEn" placeholder="Name (English)" required />
            <Input name="nameBn" placeholder="নাম (বাংলা)" lang="bn" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="kind">Kind</Label>
            <Select id="kind" name="kind" defaultValue="other">
              {["patient", "employee", "student", "citizen", "beneficiary", "visitor", "other"].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
