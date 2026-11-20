import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getCaseStudies, getClients, getPosts, getProjects, getServices } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, clients, cases, projects, posts] = await Promise.all([getServices(), getClients(), getCaseStudies(), getProjects(), getPosts()]);
  const u = (path: string, priority = 0.6, lastModified?: string | null): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, priority, lastModified: lastModified ?? undefined });
  return [
    u("/", 1), u("/about", 0.7), u("/services", 0.9), u("/clients", 0.7), u("/portfolio", 0.7), u("/blog", 0.7), u("/contact", 0.8),
    u("/seo-tools", 0.6), u("/seo-tools/audit", 0.6), u("/seo-tools/keywords", 0.6), u("/seo-tools/score", 0.6),
    u("/privacy-policy", 0.2), u("/terms", 0.2), u("/disclaimer", 0.2),
    ...services.map((s) => u(`/services/${s.slug}`, 0.9)),
    ...clients.filter((c) => !c.is_demo).map((c) => u(`/clients/${c.slug}`, 0.6)),
    ...cases.filter((c) => !c.client?.is_demo).map((c) => u(`/clients/case-studies/${c.slug}`, 0.6)),
    ...projects.filter((p) => !p.is_demo).map((p) => u(`/portfolio/${p.slug}`, 0.6)),
    ...posts.map((p) => u(`/blog/${p.slug}`, 0.7, p.updated_at)),
  ];
}
