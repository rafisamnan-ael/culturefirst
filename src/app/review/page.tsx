import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { ReviewSearch } from "@/components/review/review-search";
import { Star, MessageSquare, ShieldCheck, PenLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function GlobalReviewPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const allOrgs = await store.listOrganizations({ pageSize: 2000 });

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-jade/5 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
      </div>

      <div className="container max-w-4xl py-12 md:py-20 text-center">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-jade-highlight px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-jade">
            <PenLine className="h-3.5 w-3.5" />
            {t("nav.writeReview")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
            {locale === "bn" ? "আপনার অভিজ্ঞতা শেয়ার করুন" : "Share your experience"}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {t("home.ctaBody")}
          </p>
        </div>

        <div className="mx-auto flex justify-center scale-110 md:scale-125 mb-16">
          <ReviewSearch
            organizations={allOrgs.items.map((o) => ({
              id: o.id,
              slug: o.slug,
              officialName: o.officialName,
              bengaliName: o.bengaliName,
            }))}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-border/60 bg-white/50 p-6 backdrop-blur-sm">
            <ShieldCheck className="mb-3 h-8 w-8 text-jade" />
            <h3 className="font-bold text-charcoal">{locale === "bn" ? "নিরাপদ ও গোপনীয়" : "Safe & Private"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "bn" 
                ? "আপনার ব্যক্তিগত তথ্য প্রকাশ করা হয় না। ছদ্মনামে রিভিউ দিতে পারেন।" 
                : "Your identity stays private. Publish under a pseudonym to protect yourself."}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/50 p-6 backdrop-blur-sm">
            <MessageSquare className="mb-3 h-8 w-8 text-jade" />
            <h3 className="font-bold text-charcoal">{locale === "bn" ? "প্রকৃত প্রভাব" : "Real Impact"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "bn"
                ? "আপনার রিভিউ অন্যদের সঠিক সিদ্ধান্ত নিতে এবং প্রতিষ্ঠানে পরিবর্তন আনতে সাহায্য করে।"
                : "Your voice helps others choose better workplaces and institutions."}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/50 p-6 backdrop-blur-sm">
            <Star className="mb-3 h-8 w-8 text-jade" />
            <h3 className="font-bold text-charcoal">{locale === "bn" ? "সঠিক মূল্যায়ন" : "Fair Scoring"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "bn"
                ? "আমাদের পদ্ধতি অনুযায়ী প্রতিটি রিভিউ সঠিকভাবে এবং ওজনযুক্তভাবে হিসাব করা হয়।"
                : "Our weighted methodology ensures every rating is counted fairly."}
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60">
          <p className="text-sm text-muted-foreground mb-4">
            {locale === "bn" ? "প্রতিষ্ঠান খুঁজে পাচ্ছেন না?" : "Can't find an organization?"}
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/contact?reason=missing-org">
              {locale === "bn" ? "নতুন প্রতিষ্ঠানের প্রস্তাব দিন" : "Suggest an organization"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
