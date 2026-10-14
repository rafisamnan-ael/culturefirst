import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";

export const dynamic = "force-dynamic";

function Metric({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "warn" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "warn" && Number(value) > 0 ? "text-[#b45309]" : "text-charcoal"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function QualityPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();

  const orgs = await store.listOrganizations({ pageSize: 5000 });
  const categories = await store.listCategories();
  const [claims, suggestions, messages] = await Promise.all([
    store.listClaims(),
    store.listSuggestions(),
    store.listContactMessages(),
  ]);

  const missingWebsite = orgs.items.filter((o) => !o.website);
  const missingBengali = orgs.items.filter((o) => !o.bengaliName);
  const missingDescription = orgs.items.filter((o) => !o.description.en.trim());

  const slugGroups = new Map<string, number>();
  for (const o of orgs.items) slugGroups.set(o.slug, (slugGroups.get(o.slug) ?? 0) + 1);
  const duplicateSlugs = [...slugGroups.entries()].filter(([, n]) => n > 1);

  const coverage: Array<{ category: string; perspective: string; ok: boolean }> = [];
  for (const c of categories) {
    const rels = await store.listRelationshipsForCategory(c.id);
    for (const r of rels) {
      const bundle = await store.getTemplateBundle(c.id, r.id);
      coverage.push({ category: pick(c.name, locale), perspective: pick(r.name, locale), ok: Boolean(bundle) });
    }
  }
  const missingTemplates = coverage.filter((x) => !x.ok);

  const pendingClaims = claims.filter((c) => c.status === "pending").length;
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
  const openMessages = messages.filter((m) => m.status === "open").length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-charcoal">
        {locale === "bn" ? "ডেটা মান" : "Data quality"}
      </h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {locale === "bn"
          ? "ডিরেক্টরি ও কনফিগারেশন ডেটার ঘাটতি এবং অপেক্ষমাণ কাজের সারসংক্ষেপ।"
          : "A snapshot of directory and configuration gaps and outstanding work."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t("admin.totalOrgs")} value={orgs.total} />
        <Metric label={locale === "bn" ? "ওয়েবসাইট ছাড়া" : "Missing website"} value={missingWebsite.length} tone="warn" />
        <Metric label={locale === "bn" ? "বাংলা নাম ছাড়া" : "Missing Bengali name"} value={missingBengali.length} tone="warn" />
        <Metric label={locale === "bn" ? "বর্ণনা ছাড়া" : "Missing description"} value={missingDescription.length} tone="warn" />
        <Metric label={locale === "bn" ? "ডুপ্লিকেট স্লাগ দল" : "Duplicate slug groups"} value={duplicateSlugs.length} tone="warn" />
        <Metric label={locale === "bn" ? "টেমপ্লেট কভারেজ ফাঁক" : "Template coverage gaps"} value={missingTemplates.length} tone="warn" />
        <Metric label={locale === "bn" ? "অপেক্ষমাণ দাবি" : "Pending claims"} value={pendingClaims} tone="warn" />
        <Metric label={locale === "bn" ? "অপেক্ষমাণ বার্তা" : "Open messages"} value={openMessages} tone="warn" />
        <Metric label={locale === "bn" ? "অপেক্ষমাণ প্রস্তাব" : "Pending suggestions"} value={pendingSuggestions} tone="warn" />
      </div>

      {duplicateSlugs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-charcoal">
            {locale === "bn" ? "ডুপ্লিকেট স্লাগ" : "Duplicate slugs"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {duplicateSlugs.map(([slug, n]) => (
              <Badge key={slug} variant="destructive">
                {slug} ×{n}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {missingTemplates.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-charcoal">
            {locale === "bn" ? "প্রকাশিত টেমপ্লেট নেই" : "Missing published templates"}
          </h2>
          <div className="space-y-1.5">
            {missingTemplates.map((m, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {m.category} — {m.perspective}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-charcoal">
          {locale === "bn" ? "ওয়েবসাইট ছাড়া প্রতিষ্ঠান" : "Organizations missing a website"}
        </h2>
        {missingWebsite.length === 0 ? (
          <p className="text-sm text-muted-foreground">{locale === "bn" ? "কোনোটি নেই।" : "None."}</p>
        ) : (
          <div className="max-h-96 space-y-1 overflow-y-auto rounded-lg border border-border bg-white p-4">
            {missingWebsite.map((o) => (
              <p key={o.id} className="text-sm">
                <Link href={`/organizations/${o.slug}`} className="text-jade hover:underline">
                  {o.officialName}
                </Link>
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
