export type FormType = "general" | "website" | "design" | "marketing" | "seo" | "social" | "ecommerce";

export interface Item { title: string; description: string }

export interface ServiceCategory {
  id: string; name: string; slug: string; short_description: string | null;
  icon: string | null; highlights: string[]; display_order: number;
}

export interface Service {
  id: string; category_id: string | null; name: string; slug: string;
  tagline: string | null; short_description: string | null; intro: string | null;
  offerings: Item[]; features: Item[]; benefits: Item[]; process: Item[];
  form_type: FormType; icon: string | null; hero_image_url: string | null;
  show_in_nav: boolean; display_order: number;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
}

export interface Industry { id: string; name: string; slug: string; icon: string | null; show_on_home: boolean; display_order: number }

export interface Client {
  id: string; client_name: string; slug: string; logo_url: string | null; website_url: string | null;
  industry_id: string | null; short_description: string | null; full_description: string | null;
  project_overview: string | null; challenges: string | null; solutions: string | null;
  project_completed_on: string | null; is_demo: boolean; featured: boolean; display_order: number;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  industry?: Industry | null; services?: { id: string; name: string; slug: string }[];
}

export interface VerifiedResult { label: string; value: string; source?: string }

export interface CaseStudy {
  id: string; client_id: string; title: string; slug: string; summary: string | null; description: string | null;
  challenges: string | null; solutions: string | null; outcome: string | null; verified_results: VerifiedResult[];
  before_image_url: string | null; after_image_url: string | null; website_url: string | null;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  client?: Client | null; services?: { id: string; name: string; slug: string }[];
}

export interface ProjectImage { id: string; image_url: string; alt_text: string; caption: string | null; case_study_id?: string | null }

export interface Testimonial {
  id: string; client_id: string | null; author_name: string; company_name: string | null; designation: string | null;
  photo_url: string | null; quote: string; rating: number | null; is_demo: boolean;
}

export interface PortfolioCategory { id: string; name: string; slug: string }

export interface PortfolioProject {
  id: string; category_id: string | null; client_id: string | null; title: string; slug: string;
  summary: string | null; description: string | null; challenge: string | null; solution: string | null; outcome: string | null;
  cover_image_url: string | null; cover_alt: string | null; project_url: string | null; completed_on: string | null;
  is_demo: boolean; featured: boolean;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  category?: PortfolioCategory | null; client?: Pick<Client, "client_name" | "slug"> | null;
}

export interface BlogPost {
  id: string; title: string; slug: string; excerpt: string | null; content: string; cover_image_url: string | null;
  cover_alt: string | null; author_name: string | null; tags: string[]; reading_minutes: number | null;
  published_at: string | null; updated_at: string; seo_title: string | null; seo_description: string | null; og_image_url: string | null;
}

export interface Slide {
  id: string; eyebrow: string | null; heading: string; description: string | null;
  primary_cta_label: string | null; primary_cta_href: string | null;
  secondary_cta_label: string | null; secondary_cta_href: string | null;
  background_image_url: string | null; visual_variant: string;
}

export interface Stat { id: string; label: string; value: number; prefix: string | null; suffix: string | null }
export interface Faq { id: string; question: string; answer: string; scope: string; service_id: string | null }

export interface Settings {
  company: { name: string; tagline: string; location: string; coverage: string; intro?: string };
  contact: { email: string; phone: string | null; whatsapp: string | null; map_embed_url: string | null };
  social: Record<string, string | null>;
  branding: { logo_url: string | null; favicon_url: string | null };
}

export interface PageSeo { path: string; title: string | null; description: string | null; og_image_url: string | null; canonical_url: string | null; noindex: boolean }
