import { z } from "zod";
import type { FormType } from "@/lib/types";

export type FieldKind = "text" | "email" | "tel" | "url" | "textarea" | "select" | "multi" | "yesno" | "number" | "date" | "file";

export interface FieldDef {
  name: string; label: string; kind: FieldKind; required?: boolean; options?: string[];
  placeholder?: string; help?: string; half?: boolean; accept?: string;
}

export const BUDGETS = ["Under ₹15,000", "₹15,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000 – ₹3,00,000", "Above ₹3,00,000", "Not sure yet"];
export const MONTHLY_BUDGETS = ["Under ₹10,000 / month", "₹10,000 – ₹25,000 / month", "₹25,000 – ₹50,000 / month", "₹50,000 – ₹1,00,000 / month", "Above ₹1,00,000 / month", "Not sure yet"];

export const COMMON_TOP: FieldDef[] = [
  { name: "full_name", label: "Full name", kind: "text", required: true, half: true },
  { name: "business_name", label: "Business name", kind: "text", half: true },
  { name: "email", label: "Email address", kind: "email", required: true, half: true },
  { name: "phone", label: "Mobile number", kind: "tel", required: true, half: true, placeholder: "+91 98xxxxxxxx" },
  { name: "city", label: "City", kind: "text", half: true },
  { name: "website_url", label: "Website URL", kind: "url", half: true, placeholder: "https://" },
];

export const COMMON_BOTTOM: FieldDef[] = [
  { name: "project_description", label: "Tell us about your project", kind: "textarea", required: true },
  { name: "budget_range", label: "Budget range", kind: "select", options: BUDGETS, half: true },
  { name: "expected_start_date", label: "Expected start date", kind: "date", half: true },
  { name: "additional_requirements", label: "Additional requirements", kind: "textarea" },
];

const yes = (name: string, label: string): FieldDef => ({ name, label, kind: "yesno", half: true });

export const FORM_FIELDS: Record<FormType, FieldDef[]> = {
  general: [],
  website: [
    { name: "website_type", label: "Type of website", kind: "select", required: true, half: true,
      options: ["Business / company website", "E-commerce store", "WordPress website", "Shopify store", "Landing page", "Custom web application", "Redesign of existing website"] },
    { name: "page_count", label: "Number of pages", kind: "select", half: true, options: ["1 (landing page)", "2–5", "6–10", "11–20", "20+", "Not sure"] },
    { name: "features", label: "Required features", kind: "multi",
      options: ["Contact / enquiry forms", "Blog", "Online payments", "Product catalogue", "Booking / appointments", "WhatsApp chat", "Multi-language", "Admin panel", "Customer login", "SEO setup"] },
    { name: "reference_website", label: "Reference website", kind: "url", half: true, placeholder: "A site you like" },
    { name: "completion_date", label: "Expected completion date", kind: "date", half: true },
    yes("domain_available", "Do you already have a domain?"),
    yes("hosting_available", "Do you already have hosting?"),
    { name: "reference_files", label: "Reference files (optional)", kind: "file", accept: ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.zip" },
  ],
  design: [
    { name: "design_requirement", label: "What do you need designed?", kind: "multi", required: true,
      options: ["Logo", "Brand identity", "Social media creatives", "Ad creatives", "Product listing images", "Amazon A+ content", "Marketing banners", "Brochure / print", "Packaging"] },
    { name: "creative_count", label: "Number of creatives", kind: "number", half: true },
    { name: "design_size", label: "Required design size(s)", kind: "text", half: true, placeholder: "e.g. 1080×1080, A4" },
    { name: "design_description", label: "Design description", kind: "textarea", placeholder: "Style, colours, message, audience" },
    { name: "brand_logo", label: "Brand logo", kind: "file", accept: ".png,.jpg,.jpeg,.webp,.pdf,.zip" },
    { name: "brand_guidelines", label: "Brand guidelines", kind: "file", accept: ".pdf,.zip,.doc,.docx" },
    { name: "reference_design", label: "Reference design", kind: "file", accept: ".png,.jpg,.jpeg,.webp,.pdf" },
  ],
  marketing: [
    { name: "business_category", label: "Business category", kind: "text", required: true, half: true },
    { name: "target_location", label: "Target location", kind: "text", half: true, placeholder: "e.g. Noida, Delhi NCR, All India" },
    { name: "target_audience", label: "Target audience", kind: "textarea", placeholder: "Who are your ideal customers?" },
    { name: "platforms", label: "Marketing platforms", kind: "multi", options: ["Google Ads", "Meta (Facebook & Instagram) Ads", "SEO", "Social media management", "LinkedIn", "YouTube", "Email / WhatsApp marketing", "Not sure — advise me"] },
    { name: "ad_budget", label: "Monthly advertising budget", kind: "select", options: MONTHLY_BUDGETS, half: true },
    { name: "marketing_goals", label: "Marketing goals", kind: "multi", options: ["More leads / enquiries", "Online sales", "Brand awareness", "Website traffic", "App installs", "Store footfall"] },
    { name: "existing_campaigns", label: "Existing campaign details", kind: "textarea", placeholder: "What have you tried so far?" },
  ],
  seo: [
    { name: "target_keywords", label: "Target keywords", kind: "textarea", required: true, placeholder: "One per line" },
    { name: "target_location", label: "Target location", kind: "text", half: true },
    { name: "current_seo_status", label: "Current SEO status", kind: "select", half: true, options: ["Never done SEO", "Done some basic SEO", "Working with another agency", "Rankings dropped recently", "Not sure"] },
    { name: "competitors", label: "Competitor websites", kind: "textarea", placeholder: "One URL per line" },
    { name: "seo_goals", label: "SEO goals", kind: "textarea" },
    { name: "seo_budget", label: "Monthly SEO budget", kind: "select", options: MONTHLY_BUDGETS, half: true },
  ],
  social: [
    { name: "social_urls", label: "Instagram / Facebook URLs", kind: "textarea", placeholder: "One per line" },
    { name: "business_category", label: "Business category", kind: "text", required: true, half: true },
    { name: "monthly_posts", label: "Posts per month", kind: "select", half: true, options: ["8", "12", "15", "20", "30", "Not sure"] },
    { name: "platforms", label: "Platforms", kind: "multi", required: true, options: ["Instagram", "Facebook", "LinkedIn", "YouTube", "X (Twitter)", "Pinterest"] },
    { name: "reels", label: "Reels per month", kind: "select", half: true, options: ["None", "2–4", "5–8", "9–12", "12+"] },
    { name: "social_budget", label: "Monthly budget", kind: "select", half: true, options: MONTHLY_BUDGETS },
    yes("ads_required", "Ad management required?"),
    { name: "content_requirements", label: "Content requirements", kind: "textarea" },
  ],
  ecommerce: [
    { name: "marketplaces", label: "Marketplaces", kind: "multi", required: true, options: ["Amazon", "Myntra", "Flipkart", "Shopify", "Meesho", "Ajio", "Nykaa", "Other"] },
    yes("existing_account", "Existing seller account?"),
    { name: "product_count", label: "Number of products", kind: "select", half: true, options: ["1–20", "21–100", "101–500", "501–2,000", "2,000+"] },
    yes("catalogue_required", "Catalogue management required?"),
    yes("listing_required", "Product listing required?"),
    yes("aplus_required", "A+ content required?"),
    yes("ads_required", "Advertising management required?"),
    { name: "ecom_budget", label: "Monthly budget", kind: "select", half: true, options: MONTHLY_BUDGETS },
  ],
};

export function fieldsFor(ft: FormType): FieldDef[] {
  return [...COMMON_TOP, ...FORM_FIELDS[ft], ...COMMON_BOTTOM];
}

/* ---------- Server-side validation ---------- */
const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number");
const optUrl = z.string().trim().max(500).optional().or(z.literal("")).refine(
  (v) => !v || /^https?:\/\/[^\s]+\.[^\s]+/i.test(v) || /^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(v), "Enter a valid URL");

export const uploadedFileSchema = z.object({
  field: z.string().max(60),
  path: z.string().regex(/^pending\/[0-9a-f-]{36}\/[\w.\- ]{1,120}$/),
  name: z.string().max(200),
  mime: z.string().max(120),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

export function enquirySchema(ft: FormType) {
  const answers: Record<string, z.ZodTypeAny> = {};
  for (const f of FORM_FIELDS[ft]) {
    if (f.kind === "file") continue;
    let s: z.ZodTypeAny;
    if (f.kind === "multi") s = z.array(f.options ? z.enum(f.options as [string, ...string[]]) : z.string().max(100)).max(20);
    else if (f.kind === "yesno") s = z.enum(["Yes", "No", ""]);
    else if (f.kind === "select") s = z.enum(["", ...(f.options ?? [])] as [string, ...string[]]);
    else if (f.kind === "number") s = z.union([z.coerce.number().int().min(0).max(100000), z.literal("")]);
    else if (f.kind === "url") s = optUrl;
    else s = z.string().trim().max(f.kind === "textarea" ? 3000 : 300);
    if (f.required) {
      s = f.kind === "multi" ? (s as z.ZodArray<z.ZodTypeAny>).min(1, `${f.label} is required`)
        : s.refine((v: unknown) => v !== "" && v !== undefined, `${f.label} is required`);
    } else s = s.optional();
    answers[f.name] = s;
  }
  return z.object({
    form_type: z.literal(ft),
    service_slug: z.string().max(100).optional(),
    service_name: z.string().max(120).optional(),
    full_name: z.string().trim().min(2, "Enter your full name").max(120),
    business_name: z.string().trim().max(160).optional(),
    email: z.string().trim().email("Enter a valid email").max(254),
    phone,
    city: z.string().trim().max(80).optional(),
    website_url: ft === "seo" ? z.string().trim().min(4, "Website URL is required for SEO").max(500) : optUrl,
    project_description: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
    budget_range: z.enum(["", ...BUDGETS] as [string, ...string[]]).optional(),
    expected_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
    additional_requirements: z.string().trim().max(3000).optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy policy" }) }),
    answers: z.object(answers).default({}),
    files: z.array(uploadedFileSchema).max(6).default([]),
    source_path: z.string().max(300).optional(),
    hp: z.string().max(0).optional(),          // honeypot must stay empty
    started_at: z.number().optional(),         // form render time, for bot timing check
  });
}

export const ALLOWED_UPLOAD_MIME = [
  "image/png", "image/jpeg", "image/webp", "application/pdf", "application/zip",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function labelFor(ft: FormType, name: string) {
  return [...fieldsFor(ft)].find((f) => f.name === name)?.label ?? name.replace(/_/g, " ");
}
