# HRIDAYA IT SOLUTIONS — Website, CMS and Lead System

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres, Auth, Storage) · Resend · provider-agnostic AI.

The site works out of the box with built-in content (services, slides, FAQs). Everything else — clients, portfolio, blog, testimonials, statistics, SEO overrides, settings — is managed from `/admin`.

---

## 1. Requirements

- Node.js 18.18+ (20 LTS recommended)
- A Supabase project (free tier is fine)
- A Resend account with a verified sending domain (free tier is fine)
- Optional: an Anthropic or OpenAI API key (AI SEO tools), a Google PageSpeed API key (free)

## 2. Database setup (Supabase)

1. Create a project at supabase.com.
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/0001_initial_schema.sql` — tables, indexes, Row Level Security, storage buckets, rate limiter.
   2. `supabase/seed.sql` — service verticals, 16 services, industries, portfolio categories, the 4 hero slides and contact settings.
3. **Authentication → Users → Add user**: create your admin login (email + password).
4. Copy that user's ID and run:
   ```sql
   insert into admin_users (id, full_name, role)
   values ('<your-user-id>', 'Kaushal', 'owner');
   ```
5. **Authentication → URL Configuration**: set Site URL to your domain and add `https://your-domain.com/admin/login` to Redirect URLs (needed for password reset and team invites).

## 3. Environment variables

Copy `.env.example` to `.env.local` (local) or add them in Vercel → Settings → Environment Variables.

| Variable | Required | Where to get it | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Your domain | e.g. `https://www.hridayaitsolutions.com`. Used for canonicals, sitemap, emails. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API | Public. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API | Public; protected by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API | **Secret. Server only.** Never prefix with `NEXT_PUBLIC_`. |
| `RESEND_API_KEY` | Yes for email | resend.com → API Keys | Secret. |
| `EMAIL_FROM` | Yes for email | Your verified Resend domain | e.g. `HRIDAYA IT SOLUTIONS <hello@yourdomain.com>`. Gmail addresses can't be used as sender. |
| `LEAD_NOTIFICATION_EMAILS` | Recommended | — | Comma separated. Defaults to `kaushalkumar2207@gmail.com`. Overrides the admin setting. |
| `AI_PROVIDER` | Optional | — | `anthropic` (default) or `openai`. |
| `AI_API_KEY` | Optional, **paid** | console.anthropic.com or platform.openai.com | Without it, SEO tools still work using rule-based output; AI summaries are skipped. |
| `AI_MODEL` | Optional | — | Override the default model. |
| `PAGESPEED_API_KEY` | Optional, free | Google Cloud Console → enable PageSpeed Insights API | Without it, the performance score is labelled "estimated". |
| `IP_HASH_SALT` | Yes | Any random 32+ character string | Used to hash IPs for rate limiting (raw IPs are never stored). |
| `CRON_SECRET` | Yes on Vercel | Any random string | Protects `/api/cron/retry-emails`. Vercel Cron sends it automatically. |

**Paid services:** AI provider (usage-based). Search volume / difficulty / CPC data is intentionally not shown; adding it requires a paid provider such as DataForSEO or Google Ads Keyword Planner API.

## 4. Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Admin: `http://localhost:3000/admin`.

Other commands: `npm run build`, `npm start`, `npm run typecheck`.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project** → import the repo. Framework is detected automatically.
3. Add all environment variables from section 3.
4. Deploy, then add your custom domain under **Settings → Domains**.
5. `vercel.json` schedules the email-retry job **once a day** (the Hobby plan limit). On Vercel Pro you can change the schedule to `*/15 * * * *`. The "Resend emails" button on each lead works anytime.
6. After launch: submit `https://your-domain.com/sitemap.xml` in Google Search Console, and send a test enquiry from each form.

## 6. How things work

### Leads
`/api/enquiries` → validates (Zod, server-side) → spam checks (honeypot, timing, rate limit 5 per 10 min per IP) → **saves the lead first** → attaches files → emails you and the customer. If an email fails, the lead keeps `admin_email_status = failed`, is shown in red on the dashboard, and is retried by cron or the admin button (max 5 attempts each).

Files go directly from the browser to the private `enquiry-uploads` bucket via one-time signed upload URLs (10 MB max, PDF/JPG/PNG/WebP/DOC/DOCX/ZIP). Admins download them through short-lived signed links. Notification emails contain 7-day links.

### Service forms
Each service has a `form_type` (website, design, marketing, seo, social, ecommerce, general) that selects the field set in `lib/forms.ts`. Change a service's form in the admin.

### AI SEO tools
- Pages are fetched server-side with SSRF protection (`lib/seo/safe-fetch.ts`): http/https only, ports 80/443, domains only, every resolved IP checked against private/reserved ranges inside the socket lookup, manual redirect validation, 8 s timeout, 2 MB cap.
- Scores are deterministic (`lib/seo/score.ts`). The AI only receives the extracted facts and writes explanations; it cannot change scores.
- Reports are stored for 30 days; the audit PDF is generated with `pdf-lib`.
- Rate limit: 10 runs per hour per IP per tool.

### Content and placeholders
- No fake clients, testimonials or statistics are seeded. Empty sections show clearly marked demo placeholders or explain that content is coming.
- Any client, project or testimonial can be flagged **Demo placeholder**: it shows a visible "Demo" badge, is set to `noindex`, and is excluded from the sitemap and structured data.
- Statistics appear only after you publish real numbers.
- Service pages fall back to built-in copy (`lib/content.ts`) for any section you haven't filled in the admin.

### Admin roles
| Role | Can do |
|---|---|
| Owner | Everything, including settings, team, deleting leads |
| Editor | All content and lead management |
| Viewer | Read only |

Permissions are enforced by database RLS, not just the UI.

## 7. Project structure

```
app/(site)/        public pages (home, about, services, clients, portfolio, blog, contact, seo-tools, legal, search)
app/admin/         login, dashboard, leads, generic content editor, settings, SEO, subscribers, team
app/api/           enquiries, uploads, newsletter, SEO tools, PDF, CSV export, cron
components/        site chrome, homepage, forms, SEO tools, admin
lib/               data access, content, forms, email, AI, SEO engine, auth, rate limiting
lib/admin-resources.ts   declarative config for every CMS module
supabase/          migration + seed
```

To add a field to a CMS module: add the column in a new migration, then add one entry to that resource in `lib/admin-resources.ts`.

## 8. Testing checklist after deployment

- [ ] Every menu link and dropdown on desktop and mobile (360, 390, 768, 1024, 1440 px)
- [ ] Submit each of the 7 forms; confirm both emails arrive and the lead appears in `/admin/leads`
- [ ] Upload a file in the Graphic Design form and download it from the lead page
- [ ] Add a client with logo, mark it featured, confirm it appears on the homepage and `/clients/<slug>`
- [ ] Add a portfolio project linked to a service; confirm it appears on that service page
- [ ] Publish a blog post; confirm it appears in `/blog`, search and the sitemap
- [ ] Run the SEO audit on your own site and download the PDF
- [ ] Set your WhatsApp number in Settings; confirm the floating button appears
- [ ] Have the Privacy Policy, Terms and Disclaimer reviewed by a legal professional

## 9. Verified during development

Production build passes with no type errors. Tested against Postgres + PostgREST (Supabase's REST layer): all public pages render from the database, lead saved when email fails, rate limit blocks the 6th submission, anonymous direct reads/inserts of leads are blocked by RLS, demo entries are badged and excluded from the sitemap, SSRF attempts (localhost, raw IPs, metadata IP, non-standard ports, `file://`, credentials in URL) are rejected.

Not tested in development (needs live accounts): Supabase Auth login, Supabase Storage uploads, Resend delivery, AI provider and PageSpeed calls.
