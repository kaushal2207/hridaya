-- =====================================================================
-- HRIDAYA IT SOLUTIONS — Initial schema (Supabase / Postgres 15+)
-- Public content is readable when published; all writes go through
-- admins (RLS) or server routes using the service-role key.
-- Lead inserts NEVER come from the browser directly.
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------- Enums ----------
create type public.admin_role      as enum ('owner', 'editor', 'viewer');
create type public.lead_status     as enum ('new', 'contacted', 'in_progress', 'proposal_sent', 'converted', 'lost', 'spam');
create type public.delivery_status as enum ('pending', 'sent', 'failed', 'skipped');
create type public.form_type       as enum ('general', 'website', 'design', 'marketing', 'seo', 'social', 'ecommerce');
create type public.seo_tool        as enum ('audit', 'keywords', 'score');

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- Admin users & role helpers ----------
create table public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       public.admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and role in ('owner', 'editor'));
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and role = 'owner');
$$;

-- ---------- Settings & SEO ----------
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  is_public  boolean not null default true,   -- secrets live in env vars, never here
  updated_at timestamptz not null default now()
);

create table public.page_seo (
  path          text primary key,              -- e.g. '/', '/about', '/clients'
  title         text,
  description   text,
  og_image_url  text,
  canonical_url text,
  noindex       boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- ---------- Taxonomies ----------
create table public.industries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  icon          text,
  show_on_home  boolean not null default true,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.service_categories (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  short_description text,
  icon              text,                      -- lucide icon name
  highlights        jsonb not null default '[]',
  published         boolean not null default true,
  display_order     int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.services (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.service_categories(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  tagline           text,
  short_description text,
  intro             text,
  offerings         jsonb not null default '[]',  -- [{title, description}]
  features          jsonb not null default '[]',
  benefits          jsonb not null default '[]',
  process           jsonb not null default '[]',
  form_type         public.form_type not null default 'general',
  icon              text,
  hero_image_url    text,
  show_in_nav       boolean not null default true,
  published         boolean not null default false,
  display_order     int not null default 0,
  seo_title         text,
  seo_description   text,
  og_image_url      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index services_category_idx on public.services (category_id, display_order);

-- ---------- Clients ----------
create table public.clients (
  id                    uuid primary key default gen_random_uuid(),
  client_name           text not null,
  slug                  text not null unique,
  logo_url              text,
  website_url           text,
  industry_id           uuid references public.industries(id) on delete set null,
  short_description     text,
  full_description      text,
  project_overview      text,
  challenges            text,
  solutions             text,
  project_completed_on  date,
  is_demo               boolean not null default false,  -- shown with a "Demo" badge, excluded from schema.org
  featured              boolean not null default false,
  published             boolean not null default false,
  display_order         int not null default 0,
  seo_title             text,
  seo_description       text,
  og_image_url          text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index clients_listing_idx  on public.clients (published, display_order);
create index clients_featured_idx on public.clients (featured, published, display_order);
create index clients_industry_idx on public.clients (industry_id);

-- services_provided as a join table (enables internal links client <-> service pages)
create table public.client_services (
  client_id  uuid not null references public.clients(id)  on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (client_id, service_id)
);
create index client_services_service_idx on public.client_services (service_id);

create table public.client_case_studies (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  title            text not null,
  slug             text not null unique,
  summary          text,
  description      text,
  challenges       text,
  solutions        text,
  outcome          text,
  -- Only verified results: [{label, value, source}] — admin UI requires a source note
  verified_results jsonb not null default '[]',
  before_image_url text,
  after_image_url  text,
  website_url      text,
  published        boolean not null default false,
  display_order    int not null default 0,
  seo_title        text,
  seo_description  text,
  og_image_url     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index case_studies_client_idx on public.client_case_studies (client_id, display_order);

create table public.case_study_services (
  case_study_id uuid not null references public.client_case_studies(id) on delete cascade,
  service_id    uuid not null references public.services(id) on delete cascade,
  primary key (case_study_id, service_id)
);

create table public.client_project_images (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  case_study_id uuid references public.client_case_studies(id) on delete cascade,
  image_url     text not null,
  alt_text      text not null default '',
  caption       text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index client_images_idx on public.client_project_images (client_id, display_order);

-- One testimonials table serves both homepage and client profiles (client_id optional)
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references public.clients(id) on delete set null,
  author_name   text not null,
  company_name  text,
  designation   text,
  photo_url     text,
  quote         text not null,
  rating        smallint check (rating is null or rating between 1 and 5),  -- only if genuinely given
  is_demo       boolean not null default false,
  featured      boolean not null default false,
  published     boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index testimonials_listing_idx on public.testimonials (published, featured, display_order);
create index testimonials_client_idx  on public.testimonials (client_id);

-- ---------- Portfolio ----------
create table public.portfolio_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.portfolio_projects (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references public.portfolio_categories(id) on delete set null,
  client_id       uuid references public.clients(id) on delete set null,
  title           text not null,
  slug            text not null unique,
  summary         text,
  description     text,
  challenge       text,
  solution        text,
  outcome         text,
  cover_image_url text,
  cover_alt       text,
  project_url     text,
  completed_on    date,
  is_demo         boolean not null default false,
  featured        boolean not null default false,
  published       boolean not null default false,
  display_order   int not null default 0,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index portfolio_listing_idx on public.portfolio_projects (published, category_id, display_order);
create index portfolio_client_idx  on public.portfolio_projects (client_id);

create table public.portfolio_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.portfolio_projects(id) on delete cascade,
  image_url     text not null,
  alt_text      text not null default '',
  caption       text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index portfolio_images_idx on public.portfolio_images (project_id, display_order);

create table public.portfolio_project_services (
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (project_id, service_id)
);
create index portfolio_services_service_idx on public.portfolio_project_services (service_id);

-- ---------- Blog ----------
create table public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text not null default '',     -- Markdown, sanitised on render
  cover_image_url text,
  cover_alt       text,
  author_name     text,
  tags            text[] not null default '{}',
  reading_minutes int,
  published       boolean not null default false,
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  search          tsvector generated always as (
                    setweight(to_tsvector('english', coalesce(title, '')),   'A') ||
                    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(content, '')), 'C')
                  ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index blog_listing_idx on public.blog_posts (published, published_at desc);
create index blog_search_idx  on public.blog_posts using gin (search);
create index blog_tags_idx    on public.blog_posts using gin (tags);

-- ---------- Homepage content ----------
create table public.homepage_slides (
  id                   uuid primary key default gen_random_uuid(),
  eyebrow              text,
  heading              text not null,
  description          text,
  primary_cta_label    text,
  primary_cta_href     text,
  secondary_cta_label  text,
  secondary_cta_href   text,
  background_image_url text,
  visual_variant       text not null default 'orbit',  -- which animated visual the slide uses
  published            boolean not null default true,
  display_order        int not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Statistics are entered by the admin only; the section hides when none are published
create table public.stats (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  value         numeric not null,
  prefix        text,
  suffix        text,
  published     boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.faqs (
  id            uuid primary key default gen_random_uuid(),
  question      text not null,
  answer        text not null,
  scope         text not null default 'general'
                check (scope in ('home', 'general', 'service', 'clients', 'seo_tools')),
  service_id    uuid references public.services(id) on delete cascade,
  published     boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index faqs_scope_idx on public.faqs (scope, service_id, published, display_order);

-- ---------- Leads ----------
create table public.enquiries (
  id                      uuid primary key default gen_random_uuid(),
  service_id              uuid references public.services(id) on delete set null,
  service_name            text not null,             -- snapshot, survives service rename/delete
  form_type               public.form_type not null default 'general',
  full_name               text not null check (char_length(full_name) between 2 and 120),
  business_name           text check (char_length(business_name) <= 160),
  email                   citext not null check (char_length(email) <= 254),
  phone                   text not null check (char_length(phone) between 7 and 20),
  city                    text check (char_length(city) <= 80),
  website_url             text check (char_length(website_url) <= 500),
  budget_range            text,
  expected_start_date     date,
  project_description     text check (char_length(project_description) <= 5000),
  additional_requirements text check (char_length(additional_requirements) <= 3000),
  answers                 jsonb not null default '{}',   -- service-specific fields
  consent                 boolean not null check (consent),
  consent_at              timestamptz not null default now(),
  source_path             text,
  ip_hash                 text,                          -- salted hash, not raw IP
  user_agent              text,
  status                  public.lead_status not null default 'new',
  admin_email_status      public.delivery_status not null default 'pending',
  admin_email_attempts    int not null default 0,
  admin_email_last_error  text,
  customer_email_status   public.delivery_status not null default 'pending',
  customer_email_attempts int not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index enquiries_status_idx  on public.enquiries (status, created_at desc);
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_retry_idx   on public.enquiries (admin_email_status) where admin_email_status in ('pending', 'failed');
create index enquiries_email_idx   on public.enquiries (email);

create table public.enquiry_files (
  id            uuid primary key default gen_random_uuid(),
  enquiry_id    uuid not null references public.enquiries(id) on delete cascade,
  field_name    text not null,           -- e.g. 'brand_logo', 'brand_guidelines'
  storage_path  text not null,           -- path inside private 'enquiry-uploads' bucket
  original_name text not null,
  mime_type     text not null,
  size_bytes    int not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at    timestamptz not null default now()
);
create index enquiry_files_idx on public.enquiry_files (enquiry_id);

create table public.enquiry_notes (
  id         uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  author_id  uuid references public.admin_users(id) on delete set null,
  note       text not null check (char_length(note) <= 5000),
  created_at timestamptz not null default now()
);
create index enquiry_notes_idx on public.enquiry_notes (enquiry_id, created_at);

create table public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           citext not null unique,
  status          text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source_path     text,
  unsubscribe_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ---------- AI SEO tool reports ----------
create table public.seo_reports (
  id          uuid primary key default gen_random_uuid(),
  tool        public.seo_tool not null,
  target_url  text,
  keyword     text,
  input       jsonb not null default '{}',
  extracted   jsonb not null default '{}',   -- raw facts pulled from the page (ground truth)
  scores      jsonb not null default '{}',   -- deterministic, computed from `extracted`
  issues      jsonb not null default '[]',
  ai_output   jsonb,                         -- AI narrative/keyword ideas, labelled as AI-generated
  ai_model    text,
  share_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  ip_hash     text,
  lead_id     uuid references public.enquiries(id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 days'
);
create index seo_reports_created_idx on public.seo_reports (created_at desc);

-- ---------- Rate limiting (fixed window, server-only) ----------
create table public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  hits         int not null default 0,
  primary key (key, window_start)
);

create or replace function public.hit_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits   int;
begin
  insert into public.rate_limits (key, window_start, hits) values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return v_hits <= p_max;
end $$;
revoke all on function public.hit_rate_limit(text, int, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.hit_rate_limit(text, int, int) to service_role;
  end if;
end $$;

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'page_seo', 'industries', 'service_categories', 'services', 'clients',
    'client_case_studies', 'testimonials', 'portfolio_categories', 'portfolio_projects',
    'blog_posts', 'homepage_slides', 'stats', 'faqs', 'enquiries'
  ] loop
    execute format('create trigger %I_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users', 'site_settings', 'page_seo', 'industries', 'service_categories', 'services',
    'clients', 'client_services', 'client_case_studies', 'case_study_services',
    'client_project_images', 'testimonials', 'portfolio_categories', 'portfolio_projects',
    'portfolio_images', 'portfolio_project_services', 'blog_posts', 'homepage_slides', 'stats',
    'faqs', 'enquiries', 'enquiry_files', 'enquiry_notes', 'newsletter_subscribers',
    'seo_reports', 'rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Content tables: any admin can read everything, owners/editors can write
  foreach t in array array[
    'site_settings', 'page_seo', 'industries', 'service_categories', 'services', 'clients',
    'client_services', 'client_case_studies', 'case_study_services', 'client_project_images',
    'testimonials', 'portfolio_categories', 'portfolio_projects', 'portfolio_images',
    'portfolio_project_services', 'blog_posts', 'homepage_slides', 'stats', 'faqs'
  ] loop
    execute format('create policy "admin read %1$s"   on public.%1$I for select to authenticated using (public.is_admin())', t);
    execute format('create policy "editor insert %1$s" on public.%1$I for insert to authenticated with check (public.is_editor())', t);
    execute format('create policy "editor update %1$s" on public.%1$I for update to authenticated using (public.is_editor()) with check (public.is_editor())', t);
    execute format('create policy "editor delete %1$s" on public.%1$I for delete to authenticated using (public.is_editor())', t);
  end loop;
end $$;

-- Public (anon + authenticated) read of published content
create policy "public read settings"   on public.site_settings      for select using (is_public);
create policy "public read page_seo"   on public.page_seo           for select using (true);
create policy "public read industries" on public.industries         for select using (true);
create policy "public read categories" on public.service_categories for select using (published);
create policy "public read services"   on public.services           for select using (published);
create policy "public read clients"    on public.clients            for select using (published);
create policy "public read client_services" on public.client_services for select
  using (exists (select 1 from public.clients c where c.id = client_id and c.published));
create policy "public read case studies" on public.client_case_studies for select
  using (published and exists (select 1 from public.clients c where c.id = client_id and c.published));
create policy "public read case_study_services" on public.case_study_services for select
  using (exists (select 1 from public.client_case_studies s where s.id = case_study_id and s.published));
create policy "public read client images" on public.client_project_images for select
  using (exists (select 1 from public.clients c where c.id = client_id and c.published));
create policy "public read testimonials" on public.testimonials for select using (published);
create policy "public read portfolio categories" on public.portfolio_categories for select using (true);
create policy "public read portfolio" on public.portfolio_projects for select using (published);
create policy "public read portfolio images" on public.portfolio_images for select
  using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.published));
create policy "public read portfolio services" on public.portfolio_project_services for select
  using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.published));
create policy "public read blog" on public.blog_posts for select
  using (published and published_at is not null and published_at <= now());
create policy "public read slides" on public.homepage_slides for select using (published);
create policy "public read stats"  on public.stats           for select using (published);
create policy "public read faqs"   on public.faqs            for select using (published);

-- Admin users: see yourself (or all, if admin); only owners manage roles
create policy "admin_users read"   on public.admin_users for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin_users insert" on public.admin_users for insert to authenticated with check (public.is_owner());
create policy "admin_users update" on public.admin_users for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "admin_users delete" on public.admin_users for delete to authenticated using (public.is_owner() and id <> auth.uid());

-- Leads: inserted only by server routes (service role bypasses RLS)
create policy "admin read enquiries"   on public.enquiries for select to authenticated using (public.is_admin());
create policy "editor update enquiries" on public.enquiries for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "owner delete enquiries" on public.enquiries for delete to authenticated using (public.is_owner());
create policy "admin read enquiry files" on public.enquiry_files for select to authenticated using (public.is_admin());
create policy "admin read notes"   on public.enquiry_notes for select to authenticated using (public.is_admin());
create policy "editor add notes"   on public.enquiry_notes for insert to authenticated
  with check (public.is_editor() and author_id = auth.uid());
create policy "admin read subscribers"  on public.newsletter_subscribers for select to authenticated using (public.is_admin());
create policy "owner delete subscribers" on public.newsletter_subscribers for delete to authenticated using (public.is_owner());
create policy "admin read seo reports"  on public.seo_reports for select to authenticated using (public.is_admin());
-- rate_limits: no policies at all → only reachable via hit_rate_limit() from the server

-- =====================================================================
-- Storage buckets
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('enquiry-uploads', 'enquiry-uploads', false, 10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/zip',
          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "media public read"   on storage.objects for select using (bucket_id = 'media');
create policy "media editor insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_editor());
create policy "media editor update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_editor());
create policy "media editor delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_editor());
-- enquiry-uploads: written by server only; admins get short-lived signed URLs
create policy "enquiry uploads admin read" on storage.objects for select to authenticated
  using (bucket_id = 'enquiry-uploads' and public.is_admin());
