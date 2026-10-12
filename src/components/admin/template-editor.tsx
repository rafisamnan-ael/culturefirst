"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/toast";
import { saveTemplateAction, publishTemplateAction } from "@/lib/actions/admin";
import { validateTemplateWeights } from "@/lib/scoring";
import type { Bilingual, OrganizationCategory, RatingTemplateVersion, ReviewerRelationshipType } from "@/types/domain";

interface EditorQuestion {
  text: Bilingual;
  required: boolean;
}
interface EditorParam {
  key: string;
  name: Bilingual;
  weight: number;
  questions: EditorQuestion[];
}

export function TemplateEditor({
  mode,
  templateId,
  initialName,
  initialRelationshipIds,
  initialParameters,
  categoryId,
  categories,
  relationships,
  versions = [],
}: {
  mode: "create" | "edit";
  templateId?: string;
  initialName: Bilingual;
  initialRelationshipIds: string[];
  initialParameters: EditorParam[];
  categoryId?: string;
  categories: OrganizationCategory[];
  relationships: ReviewerRelationshipType[];
  versions?: RatingTemplateVersion[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { t: tr } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<Bilingual>(initialName);
  const [catId, setCatId] = useState(categoryId ?? categories[0]?.id ?? "");
  const [relIds, setRelIds] = useState<string[]>(initialRelationshipIds);
  const [params, setParams] = useState<EditorParam[]>(initialParameters);

  const weightCheck = useMemo(() => validateTemplateWeights(params.map((p) => ({ weight: p.weight }))), [params]);

  function updateParam(i: number, patch: Partial<EditorParam>) {
    setParams((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function addParam() {
    setParams((prev) => [
      ...prev,
      {
        key: `param-${prev.length + 1}`,
        name: { en: "New parameter", bn: "নতুন প্যারামিটার" },
        weight: 0,
        questions: [{ text: { en: "", bn: "" }, required: true }],
      },
    ]);
  }

  async function saveDraft() {
    setBusy(true);
    const res = await saveTemplateAction({
      templateId: templateId,
      categoryId: catId,
      relationshipTypeIds: relIds,
      name,
      parameters: params.map((p, i) => ({
        key: p.key,
        name: p.name,
        weight: p.weight,
        order: i,
        questions: p.questions.map((q, qi) => ({ text: q.text, required: q.required, order: qi })),
      })),
    });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Draft saved" });
      router.refresh();
    } else toast({ kind: "error", title: res.error });
  }

  async function publish() {
    if (!templateId) {
      toast({ kind: "info", title: "Save the draft first" });
      return;
    }
    if (!weightCheck.valid) {
      toast({ kind: "error", title: tr("admin.weightsBad") });
      return;
    }
    setBusy(true);
    const res = await publishTemplateAction({ templateId, changeNote: "Published from admin" });
    setBusy(false);
    if (res.ok) {
      toast({ kind: "success", title: "Version published" });
      router.refresh();
    } else toast({ kind: "error", title: res.error });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {tr("admin.createTemplate")}
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            {tr("admin.preview")} / Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? tr("admin.createTemplate") : name.en}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={name.en} onChange={(e) => setName({ ...name, en: e.target.value })} placeholder="Template name (English)" />
            <Input value={name.bn} onChange={(e) => setName({ ...name, bn: e.target.value })} placeholder="টেমপ্লেট নাম (বাংলা)" lang="bn" />
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={catId} onChange={(e) => setCatId(e.target.value)} disabled={mode === "edit"}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name.en}</option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-charcoal">Applies to relationships</p>
            <div className="flex flex-wrap gap-3">
              {relationships.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={relIds.includes(r.id)}
                    onChange={() => setRelIds((prev) => (prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]))}
                    className="h-4 w-4 rounded border-border text-jade"
                  />
                  {r.name.en}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Parameters</p>
            <div className="flex items-center gap-2">
              <Badge variant={weightCheck.valid ? "jade" : "destructive"}>
                {weightCheck.total.toFixed(0)}% {weightCheck.valid ? "✓" : "≠ 100%"}
              </Badge>
              <Button variant="outline" size="sm" onClick={addParam}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {params.map((p, i) => (
              <div key={i} className="space-y-2 rounded-md border border-border p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                  <Input value={p.name.en} onChange={(e) => updateParam(i, { name: { ...p.name, en: e.target.value } })} placeholder="Parameter name" />
                  <Input value={p.name.bn} onChange={(e) => updateParam(i, { name: { ...p.name, bn: e.target.value } })} placeholder="প্যারামিটার" lang="bn" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={p.weight}
                    onChange={(e) => updateParam(i, { weight: Number(e.target.value) })}
                    aria-label="Weight"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setParams((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove parameter"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-1 pl-1">
                  {p.questions.map((q, qi) => (
                    <div key={qi} className="flex items-center gap-2">
                      <Input
                        value={q.text.en}
                        onChange={(e) =>
                          updateParam(i, {
                            questions: p.questions.map((x, xi) => (xi === qi ? { ...x, text: { ...x.text, en: e.target.value } } : x)),
                          })
                        }
                        placeholder="Question (English)"
                      />
                      <Input
                        value={q.text.bn}
                        onChange={(e) =>
                          updateParam(i, {
                            questions: p.questions.map((x, xi) => (xi === qi ? { ...x, text: { ...x.text, bn: e.target.value } } : x)),
                          })
                        }
                        placeholder="প্রশ্ন (বাংলা)"
                        lang="bn"
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            updateParam(i, {
                              questions: p.questions.map((x, xi) => (xi === qi ? { ...x, required: e.target.checked } : x)),
                            })
                          }
                        />
                        req
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateParam(i, { questions: p.questions.filter((_, xi) => xi !== qi) })
                        }
                        aria-label="Remove question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateParam(i, { questions: [...p.questions, { text: { en: "", bn: "" }, required: true }] })}
                  >
                    <Plus className="h-3.5 w-3.5" /> Question
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {mode === "edit" && versions.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <p className="mb-2 text-sm font-medium text-charcoal">Version history</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between">
                    <span>v{v.version}</span>
                    <Badge variant={v.status === "published" ? "jade" : v.status === "draft" ? "gold" : "outline"}>
                      {v.status}
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Published versions are immutable. Publishing a new version keeps historical reviews on their original version.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={saveDraft} disabled={busy}>
              {busy ? "Saving…" : "Save draft"}
            </Button>
            {mode === "edit" && (
              <Button variant="accent" onClick={publish} disabled={busy || !weightCheck.valid}>
                {tr("admin.publishVersion")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
