import type { MetadataRoute } from "next";
import { getStore } from "@/lib/data";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getStore();
  const staticPaths = [
    "",
    "/organizations",
    "/categories",
    "/how-it-works",
    "/methodology",
    "/about",
    "/privacy",
    "/terms",
    "/community-guidelines",
    "/contact",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.6,
  }));

  // Only index active organizations (never pending/merged listings).
  const orgs = await store.listOrganizations({ pageSize: 5000 });
  for (const o of orgs.items) {
    if (o.status !== "active") continue;
    entries.push({
      url: `${siteUrl}/organizations/${o.slug}`,
      lastModified: o.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const categories = await store.listCategories();
  for (const c of categories) {
    entries.push({
      url: `${siteUrl}/categories/${c.slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
