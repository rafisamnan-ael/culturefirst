import { getStore } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const store = await getStore();
  const settings = await store.getSettings();
  return (
    <div>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight text-charcoal">Platform settings</h1>
      <SettingsForm initial={settings} />
      <div className="mt-8 rounded-md border border-gold/30 bg-gold/10 p-4 text-xs text-[#7a5f2e]">
        Sensitive server environment variables (e.g. NEXT_PUBLIC_SUPABASE_URL) are managed through
        Vercel project settings and are never stored in the database. Review the deployment docs
        before changing them.
      </div>
    </div>
  );
}
