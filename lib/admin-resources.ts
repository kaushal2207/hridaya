/** Declarative config for every CMS module. One generic list + form renders all of them. */
export type FieldType = "text" | "slug" | "textarea" | "markdown" | "number" | "boolean" | "date" | "select" | "relation" | "multirelation" | "image" | "items" | "results" | "list" | "tags" | "icon" | "url";

export interface AdminField {
  name: string; label: string; type: FieldType; required?: boolean; help?: string; options?: string[];
  relation?: { table: string; label: string; order?: string };
  join?: { table: string; self: string; other: string };   // for multirelation
  from?: string;                                            // slug source field
  bucketFolder?: string;
  group?: string;
}

export interface AdminResource {
  key: string; table: string; title: string; singular: string; pk?: string;
  listColumns: { name: string; label: string; type?: "boolean" | "image" | "relation" | "date" }[];
  order: { column: string; ascending?: boolean }; searchColumn?: string;
  fields: AdminField[]; publicPath?: (row: Record<string, unknown>) => string | null; note?: string;
}

const seo = (): AdminField[] => [
  { name: "seo_title", label: "SEO title", type: "text", help: "About 50–60 characters. Leave blank to use the default.", group: "SEO" },
  { name: "seo_description", label: "Meta description", type: "textarea", help: "About 120–160 characters.", group: "SEO" },
  { name: "og_image_url", label: "Open Graph image", type: "image", bucketFolder: "og", group: "SEO" },
];
const publish = (extra: AdminField[] = []): AdminField[] => [
  { name: "published", label: "Published", type: "boolean", group: "Publishing" }, ...extra,
  { name: "display_order", label: "Display order", type: "number", help: "Lower numbers appear first.", group: "Publishing" },
];

export const RESOURCES: AdminResource[] = [
  {
    key: "services", table: "services", title: "Services", singular: "service", order: { column: "display_order" }, searchColumn: "name",
    listColumns: [{ name: "name", label: "Name" }, { name: "category_id", label: "Category", type: "relation" }, { name: "form_type", label: "Form" }, { name: "published", label: "Live", type: "boolean" }],
    publicPath: (r) => `/services/${r.slug}`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", from: "name", required: true },
      { name: "category_id", label: "Category", type: "relation", relation: { table: "service_categories", label: "name", order: "display_order" } },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "short_description", label: "Short description", type: "textarea" },
      { name: "intro", label: "Introduction", type: "textarea", help: "Leave blank to use built-in copy." },
      { name: "offerings", label: "What we offer", type: "items", help: "Leave empty to use built-in copy." },
      { name: "features", label: "Extra features", type: "items" },
      { name: "benefits", label: "Benefits", type: "items" },
      { name: "process", label: "Working process", type: "items" },
      { name: "form_type", label: "Enquiry form", type: "select", options: ["general", "website", "design", "marketing", "seo", "social", "ecommerce"] },
      { name: "hero_image_url", label: "Hero image", type: "image", bucketFolder: "services" },
      { name: "show_in_nav", label: "Show in menu", type: "boolean" },
      ...publish(), ...seo(),
    ],
  },
  {
    key: "service-categories", table: "service_categories", title: "Service verticals", singular: "vertical", order: { column: "display_order" },
    listColumns: [{ name: "name", label: "Name" }, { name: "published", label: "Live", type: "boolean" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "slug", from: "name", required: true },
      { name: "icon", label: "Icon", type: "icon" }, { name: "short_description", label: "Description", type: "textarea" },
      { name: "highlights", label: "Highlights (one per line)", type: "list" }, ...publish(),
    ],
  },
  {
    key: "clients", table: "clients", title: "Clients", singular: "client", order: { column: "display_order" }, searchColumn: "client_name",
    listColumns: [{ name: "logo_url", label: "", type: "image" }, { name: "client_name", label: "Client" }, { name: "industry_id", label: "Industry", type: "relation" }, { name: "featured", label: "Home", type: "boolean" }, { name: "published", label: "Live", type: "boolean" }, { name: "is_demo", label: "Demo", type: "boolean" }],
    publicPath: (r) => `/clients/${r.slug}`,
    note: "Only add real clients with permission to show their name and logo. Use “Demo placeholder” for layout previews.",
    fields: [
      { name: "client_name", label: "Client / brand name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", from: "client_name", required: true },
      { name: "logo_url", label: "Logo", type: "image", bucketFolder: "clients" },
      { name: "website_url", label: "Website URL", type: "url" },
      { name: "industry_id", label: "Industry", type: "relation", relation: { table: "industries", label: "name", order: "display_order" } },
      { name: "services", label: "Services provided", type: "multirelation", relation: { table: "services", label: "name", order: "display_order" }, join: { table: "client_services", self: "client_id", other: "service_id" } },
      { name: "short_description", label: "Short introduction", type: "textarea" },
      { name: "full_description", label: "About the client", type: "textarea" },
      { name: "project_overview", label: "Project overview", type: "textarea" },
      { name: "challenges", label: "Challenges", type: "textarea" },
      { name: "solutions", label: "Solutions delivered", type: "textarea" },
      { name: "project_completed_on", label: "Project completion date", type: "date" },
      { name: "is_demo", label: "Demo placeholder (shows a Demo badge, hidden from Google)", type: "boolean", group: "Publishing" },
      ...publish([{ name: "featured", label: "Feature on homepage", type: "boolean", group: "Publishing" }]), ...seo(),
    ],
  },
  {
    key: "case-studies", table: "client_case_studies", title: "Case studies", singular: "case study", order: { column: "display_order" }, searchColumn: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "client_id", label: "Client", type: "relation" }, { name: "published", label: "Live", type: "boolean" }],
    publicPath: (r) => `/clients/case-studies/${r.slug}`,
    fields: [
      { name: "client_id", label: "Client", type: "relation", required: true, relation: { table: "clients", label: "client_name", order: "client_name" } },
      { name: "title", label: "Project title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "slug", from: "title", required: true },
      { name: "services", label: "Services provided", type: "multirelation", relation: { table: "services", label: "name", order: "display_order" }, join: { table: "case_study_services", self: "case_study_id", other: "service_id" } },
      { name: "summary", label: "Summary", type: "textarea" }, { name: "description", label: "Project description", type: "textarea" },
      { name: "challenges", label: "Challenges", type: "textarea" }, { name: "solutions", label: "Solutions", type: "textarea" }, { name: "outcome", label: "Project outcome", type: "textarea" },
      { name: "verified_results", label: "Verified results", type: "results", help: "Only results you can verify. Each needs a source note (e.g. “Google Analytics, Jan–Mar 2026”)." },
      { name: "before_image_url", label: "Before image", type: "image", bucketFolder: "case-studies" }, { name: "after_image_url", label: "After image", type: "image", bucketFolder: "case-studies" },
      { name: "website_url", label: "Website link", type: "url" }, ...publish(), ...seo(),
    ],
  },
  {
    key: "client-images", table: "client_project_images", title: "Client project images", singular: "image", order: { column: "display_order" },
    listColumns: [{ name: "image_url", label: "", type: "image" }, { name: "client_id", label: "Client", type: "relation" }, { name: "caption", label: "Caption" }],
    fields: [
      { name: "client_id", label: "Client", type: "relation", required: true, relation: { table: "clients", label: "client_name", order: "client_name" } },
      { name: "case_study_id", label: "Case study (optional)", type: "relation", relation: { table: "client_case_studies", label: "title", order: "title" } },
      { name: "image_url", label: "Image", type: "image", required: true, bucketFolder: "clients" },
      { name: "alt_text", label: "Alt text", type: "text", required: true, help: "Describe the image for screen readers and Google." },
      { name: "caption", label: "Caption", type: "text" }, { name: "display_order", label: "Display order", type: "number" },
    ],
  },
  {
    key: "testimonials", table: "testimonials", title: "Testimonials", singular: "testimonial", order: { column: "display_order" }, searchColumn: "author_name",
    listColumns: [{ name: "author_name", label: "Name" }, { name: "company_name", label: "Company" }, { name: "published", label: "Live", type: "boolean" }, { name: "is_demo", label: "Demo", type: "boolean" }],
    note: "Publish only genuine feedback. Demo testimonials are labelled “Demo placeholder, not a real review” on the site.",
    fields: [
      { name: "author_name", label: "Client name", type: "text", required: true }, { name: "company_name", label: "Company", type: "text" }, { name: "designation", label: "Designation", type: "text" },
      { name: "client_id", label: "Linked client profile", type: "relation", relation: { table: "clients", label: "client_name", order: "client_name" } },
      { name: "photo_url", label: "Photo (optional)", type: "image", bucketFolder: "testimonials" },
      { name: "quote", label: "Testimonial", type: "textarea", required: true },
      { name: "rating", label: "Rating 1–5 (only if the client gave one)", type: "number" },
      { name: "is_demo", label: "Demo placeholder", type: "boolean", group: "Publishing" },
      ...publish([{ name: "featured", label: "Featured", type: "boolean", group: "Publishing" }]),
    ],
  },
  {
    key: "portfolio", table: "portfolio_projects", title: "Portfolio", singular: "project", order: { column: "display_order" }, searchColumn: "title",
    listColumns: [{ name: "cover_image_url", label: "", type: "image" }, { name: "title", label: "Title" }, { name: "category_id", label: "Category", type: "relation" }, { name: "published", label: "Live", type: "boolean" }, { name: "is_demo", label: "Demo", type: "boolean" }],
    publicPath: (r) => `/portfolio/${r.slug}`,
    fields: [
      { name: "title", label: "Project name", type: "text", required: true }, { name: "slug", label: "URL slug", type: "slug", from: "title", required: true },
      { name: "category_id", label: "Category", type: "relation", relation: { table: "portfolio_categories", label: "name", order: "display_order" } },
      { name: "client_id", label: "Client", type: "relation", relation: { table: "clients", label: "client_name", order: "client_name" } },
      { name: "services", label: "Services", type: "multirelation", relation: { table: "services", label: "name", order: "display_order" }, join: { table: "portfolio_project_services", self: "project_id", other: "service_id" } },
      { name: "cover_image_url", label: "Cover image", type: "image", bucketFolder: "portfolio" }, { name: "cover_alt", label: "Cover alt text", type: "text" },
      { name: "summary", label: "Short description", type: "textarea" }, { name: "description", label: "Overview", type: "textarea" },
      { name: "challenge", label: "Challenge", type: "textarea" }, { name: "solution", label: "Solution", type: "textarea" }, { name: "outcome", label: "Outcome", type: "textarea" },
      { name: "project_url", label: "Live project URL", type: "url" }, { name: "completed_on", label: "Completed on", type: "date" },
      { name: "is_demo", label: "Demo placeholder", type: "boolean", group: "Publishing" },
      ...publish([{ name: "featured", label: "Featured", type: "boolean", group: "Publishing" }]), ...seo(),
    ],
  },
  {
    key: "portfolio-images", table: "portfolio_images", title: "Portfolio images", singular: "image", order: { column: "display_order" },
    listColumns: [{ name: "image_url", label: "", type: "image" }, { name: "project_id", label: "Project", type: "relation" }, { name: "caption", label: "Caption" }],
    fields: [
      { name: "project_id", label: "Project", type: "relation", required: true, relation: { table: "portfolio_projects", label: "title", order: "title" } },
      { name: "image_url", label: "Image", type: "image", required: true, bucketFolder: "portfolio" }, { name: "alt_text", label: "Alt text", type: "text", required: true },
      { name: "caption", label: "Caption", type: "text" }, { name: "display_order", label: "Display order", type: "number" },
    ],
  },
  {
    key: "portfolio-categories", table: "portfolio_categories", title: "Portfolio categories", singular: "category", order: { column: "display_order" },
    listColumns: [{ name: "name", label: "Name" }],
    fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "slug", from: "name", required: true }, { name: "display_order", label: "Display order", type: "number" }],
  },
  {
    key: "blog", table: "blog_posts", title: "Blog posts", singular: "post", order: { column: "created_at", ascending: false }, searchColumn: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "published_at", label: "Publish date", type: "date" }, { name: "published", label: "Live", type: "boolean" }],
    publicPath: (r) => `/blog/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "slug", from: "title", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" }, { name: "content", label: "Content (Markdown)", type: "markdown" },
      { name: "cover_image_url", label: "Featured image", type: "image", bucketFolder: "blog" }, { name: "cover_alt", label: "Featured image alt text", type: "text" },
      { name: "author_name", label: "Author", type: "text" }, { name: "tags", label: "Tags (comma separated)", type: "tags" },
      { name: "reading_minutes", label: "Reading time (minutes)", type: "number" },
      { name: "published", label: "Published", type: "boolean", group: "Publishing" },
      { name: "published_at", label: "Publish date", type: "date", group: "Publishing", help: "Posts appear once this date has passed." },
      ...seo(),
    ],
  },
  {
    key: "slides", table: "homepage_slides", title: "Homepage slides", singular: "slide", order: { column: "display_order" },
    listColumns: [{ name: "heading", label: "Heading" }, { name: "published", label: "Live", type: "boolean" }],
    fields: [
      { name: "eyebrow", label: "Small line above heading (optional)", type: "text" }, { name: "heading", label: "Heading", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "primary_cta_label", label: "Primary button text", type: "text" }, { name: "primary_cta_href", label: "Primary button link", type: "text", help: "e.g. /contact" },
      { name: "secondary_cta_label", label: "Secondary button text", type: "text" }, { name: "secondary_cta_href", label: "Secondary button link", type: "text" },
      { name: "visual_variant", label: "Visual", type: "select", options: ["orbit", "grid", "marketplace", "pulse"] }, ...publish(),
    ],
  },
  {
    key: "stats", table: "stats", title: "Statistics", singular: "statistic", order: { column: "display_order" },
    listColumns: [{ name: "label", label: "Label" }, { name: "value", label: "Value" }, { name: "published", label: "Live", type: "boolean" }],
    note: "Enter only real, verifiable numbers. The statistics strip is hidden until at least one is published.",
    fields: [{ name: "label", label: "Label", type: "text", required: true }, { name: "value", label: "Value", type: "number", required: true }, { name: "prefix", label: "Prefix", type: "text" }, { name: "suffix", label: "Suffix", type: "text", help: "e.g. + or %" }, ...publish()],
  },
  {
    key: "faqs", table: "faqs", title: "FAQs", singular: "FAQ", order: { column: "display_order" }, searchColumn: "question",
    listColumns: [{ name: "question", label: "Question" }, { name: "scope", label: "Where" }, { name: "service_id", label: "Service", type: "relation" }, { name: "published", label: "Live", type: "boolean" }],
    note: "Homepage and service pages show built-in FAQs until you publish your own for that page.",
    fields: [
      { name: "question", label: "Question", type: "text", required: true }, { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "scope", label: "Show on", type: "select", options: ["home", "general", "service", "clients", "seo_tools"] },
      { name: "service_id", label: "Service (when “Show on” is service)", type: "relation", relation: { table: "services", label: "name", order: "display_order" } }, ...publish(),
    ],
  },
  {
    key: "industries", table: "industries", title: "Industries", singular: "industry", order: { column: "display_order" },
    listColumns: [{ name: "name", label: "Name" }, { name: "show_on_home", label: "Home", type: "boolean" }],
    fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "slug", from: "name", required: true }, { name: "icon", label: "Icon", type: "icon" }, { name: "show_on_home", label: "Show on homepage", type: "boolean" }, { name: "display_order", label: "Display order", type: "number" }],
  },
  {
    key: "page-seo", table: "page_seo", pk: "path", title: "Page SEO", singular: "page SEO entry", order: { column: "path" },
    listColumns: [{ name: "path", label: "Path" }, { name: "title", label: "Title" }, { name: "noindex", label: "Noindex", type: "boolean" }],
    note: "Override title, description, Open Graph image or canonical for any page path, e.g. / or /about.",
    fields: [
      { name: "path", label: "Page path", type: "text", required: true, help: "Starts with /" }, { name: "title", label: "SEO title", type: "text" },
      { name: "description", label: "Meta description", type: "textarea" }, { name: "og_image_url", label: "Open Graph image", type: "image", bucketFolder: "og" },
      { name: "canonical_url", label: "Canonical URL", type: "url" }, { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean" },
    ],
  },
];

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key) ?? null;
