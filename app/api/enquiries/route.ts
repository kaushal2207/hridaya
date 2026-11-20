import { headers } from "next/headers";
import { enquirySchema } from "@/lib/forms";
import { fail, json, sameOrigin } from "@/lib/http";
import { clientIpHash, rateLimit } from "@/lib/rate-limit";
import { adminClient } from "@/lib/supabase/admin";
import { sendLeadEmails } from "@/lib/email";
import { hasServiceRole } from "@/lib/env";
import type { FormType } from "@/lib/types";

const FORM_TYPES: FormType[] = ["general", "website", "design", "marketing", "seo", "social", "ecommerce"];
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== "object") return fail("Invalid request");
  const ft = FORM_TYPES.includes(raw.form_type) ? (raw.form_type as FormType) : null;
  if (!ft) return fail("Unknown form");

  // Bots: honeypot filled or submitted faster than a human could type. Pretend success.
  if (raw.hp || (typeof raw.started_at === "number" && Date.now() - raw.started_at < 2500)) return json({ ok: true });

  const parsed = enquirySchema(ft).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path[i.path.length - 1]?.toString() ?? "form"] ??= i.message;
    return fail("Please check the highlighted fields", 422, { fieldErrors });
  }
  if (!hasServiceRole) return fail("The enquiry system isn't configured yet. Please email kaushalkumar2207@gmail.com.", 503);

  const ipHash = clientIpHash();
  if (!(await rateLimit("enquiry", 600, 5, ipHash))) return fail("Too many submissions. Please wait a few minutes and try again.", 429);

  const d = parsed.data;
  const db = adminClient();
  let serviceId: string | null = null;
  let serviceName = d.service_name || "General";
  if (d.service_slug) {
    const { data: svc } = await db.from("services").select("id,name").eq("slug", d.service_slug).maybeSingle();
    if (svc) { serviceId = svc.id; serviceName = svc.name; }
  }

  // 1) Save the lead first, so it is never lost even if email fails.
  const { data: lead, error } = await db.from("enquiries").insert({
    service_id: serviceId, service_name: serviceName, form_type: ft,
    full_name: d.full_name, business_name: d.business_name || null, email: d.email, phone: d.phone,
    city: d.city || null, website_url: d.website_url || null, budget_range: d.budget_range || null,
    expected_start_date: d.expected_start_date || null, project_description: d.project_description,
    additional_requirements: d.additional_requirements || null, answers: d.answers, consent: true,
    source_path: d.source_path || null, ip_hash: ipHash, user_agent: headers().get("user-agent")?.slice(0, 300) ?? null,
  }).select("id").single();
  if (error || !lead) { console.error("[enquiry]", error); return fail("We couldn't save your enquiry. Please try again or email us directly.", 500); }

  // 2) Attach uploaded files, only if they really exist in the private bucket.
  if (d.files.length) {
    const rows = [];
    for (const f of d.files) {
      const folder = f.path.split("/").slice(0, 2).join("/");
      const { data: listed } = await db.storage.from("enquiry-uploads").list(folder, { limit: 5 });
      if (listed?.some((o) => `${folder}/${o.name}` === f.path))
        rows.push({ enquiry_id: lead.id, field_name: f.field, storage_path: f.path, original_name: f.name, mime_type: f.mime, size_bytes: f.size });
    }
    if (rows.length) await db.from("enquiry_files").insert(rows);
  }

  // 3) Emails. Failures are recorded on the lead and retried by cron or the admin "Resend" button.
  try { await sendLeadEmails(lead.id); } catch (e) { console.error("[enquiry:email]", e); }
  return json({ ok: true, id: lead.id });
}
