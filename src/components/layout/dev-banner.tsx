import { dataSource } from "@/lib/config";

export function DevBanner() {
  if (dataSource !== "fixtures") return null;
  return (
    <div className="border-b border-gold/40 bg-gold/10">
      <div className="container py-2 text-center text-xs font-medium text-[#7a5f2e]">
        Development mode — displaying clearly-labelled SAMPLE organizations and reviews from local
        fixtures. No production ratings are shown. Set DATA_SOURCE=supabase for production data.
      </div>
    </div>
  );
}
