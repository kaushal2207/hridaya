import "server-only";
import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import {
  FALLBACK_CATEGORIES, FALLBACK_INDUSTRIES, FALLBACK_PORTFOLIO_CATEGORIES, FALLBACK_SERVICES, FALLBACK_SLIDES,
  HOME_FAQS, SERVICE_FAQS, withServiceDefaults,
} from "@/lib/content";
import type {
  BlogPost, CaseStudy, Client, Faq, Industry, PageSeo, PortfolioCategory, PortfolioProject, ProjectImage,
  Service, ServiceCategory, Settings, Slide, Stat, Testimonial,
} from "@/lib/types";

const DEFAULT_SETTINGS: Settings = {
  company: {
    name: "HRIDAYA IT SOLUTIONS", tagline: "Your Complete Digital Growth Partner.",
    location: "Noida, Uttar Pradesh, India", coverage: "All India (Remote Services)",
    intro: "HRIDAYA IT SOLUTIONS helps businesses establish, design, develop, market and grow their digital presence through technology, creativity, marketing and e-commerce solutions.",
  },
  contact: { email: "kaushalkumar2207@gmail.com", phone: null, whatsapp: null, map_embed_url: null },
  social: {},
  branding: { logo_url: null, favicon_url: null },
};

async function q<T>(fn: (db: NonNullable<ReturnType<typeof publicClient>>) => PromiseLike<{ data: unknown; error: unknown }>, fallback: T): Promise<T> {
  const db = publicClient();
  if (!db) return fallback;
  try {
    const { data, error } = await fn(db);
    if (error) { console.error("[data]", error); return fallback; }
    return (data as T) ?? fallback;
  } catch (e) {
    console.error("[data]", e);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await q<{ key: string; value: Record<string, unknown> }[]>((db) => db.from("site_settings").select("key,value"), []);
  const s = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, Record<string, unknown>>;
  for (const r of rows) s[r.key] = { ...(s[r.key] ?? {}), ...Object.fromEntries(Object.entries(r.value).filter(([, v]) => v !== null && v !== "")) };
  return s as unknown as Settings;
});

export const getCategories = cache(async (): Promise<ServiceCategory[]> => {
  const rows = await q<ServiceCategory[]>((db) => db.from("service_categories").select("*").order("display_order"), []);
  return rows.length ? rows : FALLBACK_CATEGORIES;
});

export const getServices = cache(async (): Promise<Service[]> => {
  const rows = await q<Service[]>((db) => db.from("services").select("*").order("display_order"), []);
  return (rows.length ? rows : FALLBACK_SERVICES).map(withServiceDefaults);
});

export const getService = cache(async (slug: string) => (await getServices()).find((s) => s.slug === slug) ?? null);

export async function getServiceFaqs(service: Service): Promise<{ question: string; answer: string }[]> {
  const rows = await q<Faq[]>((db) => db.from("faqs").select("*").eq("service_id", service.id).order("display_order"), []);
  return rows.length ? rows : SERVICE_FAQS[service.slug] ?? [];
}

export const getIndustries = cache(async (): Promise<Industry[]> => {
  const rows = await q<Industry[]>((db) => db.from("industries").select("*").order("display_order"), []);
  return rows.length ? rows : FALLBACK_INDUSTRIES;
});

export const getSlides = cache(async (): Promise<Slide[]> => {
  const rows = await q<Slide[]>((db) => db.from("homepage_slides").select("*").order("display_order"), []);
  return rows.length ? rows : FALLBACK_SLIDES;
});

export const getStats = cache(async () => q<Stat[]>((db) => db.from("stats").select("*").order("display_order"), []));

export async function getFaqs(scope: string) {
  const rows = await q<Faq[]>((db) => db.from("faqs").select("*").eq("scope", scope).order("display_order"), []);
  return rows.length ? rows : scope === "home" ? HOME_FAQS : [];
}

const CLIENT_SELECT = "*, industry:industries(*), client_services(service:services(id,name,slug))";
type RawClient = Client & { client_services?: { service: { id: string; name: string; slug: string } | null }[] };
const mapClient = (c: RawClient): Client => ({
  ...c, services: (c.client_services ?? []).map((x) => x.service).filter(Boolean) as Client["services"],
});

export const getClients = cache(async (): Promise<Client[]> =>
  (await q<RawClient[]>((db) => db.from("clients").select(CLIENT_SELECT).order("display_order"), [])).map(mapClient));

export const getFeaturedClients = cache(async () => (await getClients()).filter((c) => c.featured).slice(0, 8));

export const getClient = cache(async (slug: string) => (await getClients()).find((c) => c.slug === slug) ?? null);

export async function getClientImages(clientId: string) {
  return q<ProjectImage[]>((db) => db.from("client_project_images").select("*").eq("client_id", clientId).order("display_order"), []);
}

type RawCase = CaseStudy & { case_study_services?: { service: { id: string; name: string; slug: string } | null }[] };
const CASE_SELECT = "*, client:clients(*), case_study_services(service:services(id,name,slug))";
const mapCase = (c: RawCase): CaseStudy => ({ ...c, services: (c.case_study_services ?? []).map((x) => x.service).filter(Boolean) as CaseStudy["services"] });

export const getCaseStudies = cache(async (): Promise<CaseStudy[]> =>
  (await q<RawCase[]>((db) => db.from("client_case_studies").select(CASE_SELECT).order("display_order"), [])).map(mapCase));

export const getCaseStudy = cache(async (slug: string) => (await getCaseStudies()).find((c) => c.slug === slug) ?? null);

export const getTestimonials = cache(async () =>
  q<Testimonial[]>((db) => db.from("testimonials").select("*").order("featured", { ascending: false }).order("display_order"), []));

export const getPortfolioCategories = cache(async (): Promise<PortfolioCategory[]> => {
  const rows = await q<PortfolioCategory[]>((db) => db.from("portfolio_categories").select("*").order("display_order"), []);
  return rows.length ? rows : FALLBACK_PORTFOLIO_CATEGORIES;
});

export const getProjects = cache(async (): Promise<PortfolioProject[]> =>
  q<PortfolioProject[]>((db) => db.from("portfolio_projects").select("*, category:portfolio_categories(*), client:clients(client_name,slug)").order("display_order"), []));

export const getProject = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null);

export async function getProjectImages(projectId: string) {
  return q<ProjectImage[]>((db) => db.from("portfolio_images").select("*").eq("project_id", projectId).order("display_order"), []);
}

export async function getProjectServiceIds(projectId: string) {
  const rows = await q<{ service_id: string }[]>((db) => db.from("portfolio_project_services").select("service_id").eq("project_id", projectId), []);
  return rows.map((r) => r.service_id);
}

export async function getProjectsForService(serviceId: string) {
  const rows = await q<{ project_id: string }[]>((db) => db.from("portfolio_project_services").select("project_id").eq("service_id", serviceId), []);
  const ids = new Set(rows.map((r) => r.project_id));
  return (await getProjects()).filter((p) => ids.has(p.id)).slice(0, 3);
}

export const getPosts = cache(async (): Promise<BlogPost[]> =>
  q<BlogPost[]>((db) => db.from("blog_posts").select("id,title,slug,excerpt,content,cover_image_url,cover_alt,author_name,tags,reading_minutes,published_at,updated_at,seo_title,seo_description,og_image_url").order("published_at", { ascending: false }), []));

export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

export async function searchPosts(term: string) {
  return q<BlogPost[]>((db) => db.from("blog_posts").select("*").textSearch("search", term, { type: "websearch", config: "english" }).limit(20), []);
}

export const getPageSeo = cache(async (path: string) => {
  const rows = await q<PageSeo[]>((db) => db.from("page_seo").select("*").eq("path", path).limit(1), []);
  return rows[0] ?? null;
});
