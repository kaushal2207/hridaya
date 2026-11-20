import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { escapeHtml, formatDateTimeIST } from "@/lib/utils";
import { labelFor } from "@/lib/forms";
import type { FormType } from "@/lib/types";

const RESEND_URL = "https://api.resend.com/emails";
const MAX_ATTEMPTS = 5;

async function send(to: string[], subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM)");
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

async function recipients(db: ReturnType<typeof adminClient>) {
  const env = (process.env.LEAD_NOTIFICATION_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (env.length) return env;
  const { data } = await db.from("site_settings").select("value").eq("key", "notifications").maybeSingle();
  const list = (data?.value as { lead_recipients?: string[] } | null)?.lead_recipients ?? [];
  return list.length ? list : ["kaushalkumar2207@gmail.com"];
}

const row = (k: string, v: unknown) =>
  `<tr><td style="padding:8px 12px;border-bottom:1px solid #e6e9f2;color:#5b6478;width:38%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #e6e9f2;color:#0D1425">${escapeHtml(Array.isArray(v) ? v.join(", ") : v || "—").replace(/\n/g, "<br>")}</td></tr>`;

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#F4F6FB;font-family:Segoe UI,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#080D1B;padding:20px 24px;color:#fff;font-size:18px;font-weight:700">HRIDAYA IT SOLUTIONS<div style="font-size:13px;font-weight:400;color:#9fb0d9;margin-top:4px">${escapeHtml(title)}</div></td></tr>
<tr><td style="padding:24px">${body}</td></tr></table></td></tr></table></body></html>`;

/** Sends (or retries) the admin notification and customer acknowledgement for one enquiry. */
export async function sendLeadEmails(enquiryId: string) {
  const db = adminClient();
  const { data: e, error } = await db.from("enquiries").select("*").eq("id", enquiryId).single();
  if (error || !e) throw new Error("Enquiry not found");
  const { data: files } = await db.from("enquiry_files").select("*").eq("enquiry_id", enquiryId);

  if (e.admin_email_status !== "sent" && e.admin_email_attempts < MAX_ATTEMPTS) {
    try {
      const links: string[] = [];
      for (const f of files ?? []) {
        const { data } = await db.storage.from("enquiry-uploads").createSignedUrl(f.storage_path, 60 * 60 * 24 * 7);
        if (data?.signedUrl) links.push(`<li><a href="${escapeHtml(data.signedUrl)}">${escapeHtml(f.original_name)}</a> (${escapeHtml(labelFor(e.form_type as FormType, f.field_name))})</li>`);
      }
      const answers = Object.entries((e.answers ?? {}) as Record<string, unknown>)
        .filter(([, v]) => v !== "" && v !== undefined && !(Array.isArray(v) && !v.length))
        .map(([k, v]) => row(labelFor(e.form_type as FormType, k), v)).join("");
      const html = shell(`New ${e.service_name} enquiry`, `
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">
        ${row("Customer name", e.full_name)}${row("Email", e.email)}${row("Phone", e.phone)}
        ${row("Business name", e.business_name)}${row("City", e.city)}${row("Website", e.website_url)}
        ${row("Requested service", e.service_name)}${row("Budget", e.budget_range)}
        ${row("Expected start", e.expected_start_date)}${row("Project description", e.project_description)}
        ${answers}${row("Additional requirements", e.additional_requirements)}
        ${row("Submitted", formatDateTimeIST(e.created_at))}${row("Page", e.source_path)}
        </table>
        ${links.length ? `<p style="margin-top:20px;font-weight:600">Uploaded files (links valid 7 days)</p><ul>${links.join("")}</ul>` : ""}
        <p style="margin-top:20px;color:#5b6478;font-size:13px">Lead ID: ${escapeHtml(e.id)}. Manage it in the admin dashboard.</p>`);
      await send(await recipients(db), `New ${e.service_name} Enquiry – HRIDAYA IT SOLUTIONS`, html, e.email);
      await db.from("enquiries").update({ admin_email_status: "sent", admin_email_attempts: e.admin_email_attempts + 1, admin_email_last_error: null }).eq("id", e.id);
    } catch (err) {
      await db.from("enquiries").update({ admin_email_status: "failed", admin_email_attempts: e.admin_email_attempts + 1, admin_email_last_error: String(err).slice(0, 500) }).eq("id", e.id);
      console.error("[email:admin]", err);
    }
  }

  if (e.customer_email_status !== "sent" && e.customer_email_attempts < MAX_ATTEMPTS) {
    try {
      const html = shell("We received your enquiry", `
        <p style="font-size:15px;color:#0D1425">Hi ${escapeHtml(e.full_name)},</p>
        <p style="font-size:15px;color:#33405e;line-height:1.6">Thank you for contacting HRIDAYA IT SOLUTIONS about <strong>${escapeHtml(e.service_name)}</strong>. Our team will review your requirements and get back to you, usually within one working day.</p>
        <p style="font-size:15px;color:#33405e;line-height:1.6">If you want to add anything, simply reply to this email.</p>
        <p style="font-size:15px;color:#0D1425;margin-top:24px">Team HRIDAYA IT SOLUTIONS<br><span style="color:#5b6478">Noida, Uttar Pradesh · Serving all of India</span></p>`);
      await send([e.email], "We received your enquiry – HRIDAYA IT SOLUTIONS", html);
      await db.from("enquiries").update({ customer_email_status: "sent", customer_email_attempts: e.customer_email_attempts + 1 }).eq("id", e.id);
    } catch (err) {
      await db.from("enquiries").update({ customer_email_status: "failed", customer_email_attempts: e.customer_email_attempts + 1 }).eq("id", e.id);
      console.error("[email:customer]", err);
    }
  }
}

export async function retryPendingEmails(limit = 20) {
  const db = adminClient();
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data } = await db.from("enquiries").select("id")
    .or("admin_email_status.in.(pending,failed),customer_email_status.in.(pending,failed)")
    .lt("admin_email_attempts", MAX_ATTEMPTS).lt("created_at", cutoff).neq("status", "spam").limit(limit);
  for (const r of data ?? []) await sendLeadEmails(r.id);
  return data?.length ?? 0;
}

export async function sendNewsletterWelcome(email: string, token: string, siteUrl: string) {
  const html = shell("You're subscribed", `<p style="font-size:15px;color:#33405e;line-height:1.6">Thanks for subscribing to updates from HRIDAYA IT SOLUTIONS. We'll share practical tips on websites, marketing and e-commerce, occasionally.</p>
  <p style="font-size:13px;color:#5b6478">Changed your mind? <a href="${escapeHtml(`${siteUrl}/api/newsletter/unsubscribe?token=${token}`)}">Unsubscribe</a>.</p>`);
  await send([email], "Subscribed – HRIDAYA IT SOLUTIONS", html);
}
