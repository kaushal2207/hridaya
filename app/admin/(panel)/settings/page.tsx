import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/SettingsForm";

const GROUPS = [
  { key: "company", title: "Company", fields: [["name", "Company name"], ["tagline", "Tagline"], ["location", "Location"], ["coverage", "Service coverage"], ["intro", "Company introduction (footer and homepage)", "textarea"]] },
  { key: "contact", title: "Contact details", fields: [["email", "Public email"], ["phone", "Phone"], ["whatsapp", "WhatsApp number with country code, e.g. 919876543210"], ["map_embed_url", "Google Maps embed URL (Share → Embed a map → copy the src)"]] },
  { key: "social", title: "Social media links", fields: [["instagram", "Instagram URL"], ["facebook", "Facebook URL"], ["linkedin", "LinkedIn URL"], ["youtube", "YouTube URL"], ["x", "X (Twitter) URL"]] },
  { key: "branding", title: "Branding", fields: [["logo_url", "Logo URL (optional, the built-in logo is used if empty)"], ["favicon_url", "Favicon URL"]] },
  { key: "notifications", title: "Email notifications (private)", fields: [["lead_recipients", "Lead notification emails, comma separated", "list"], ["from_name", "Sender name"]] },
] as const;

export default async function Settings() {
  const { db, role } = await requireAdmin();
  const { data } = await db.from("site_settings").select("key, value");
  const values = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return (
    <div>
      <h1 className="!text-2xl sm:!text-3xl">Settings</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">API keys (Resend, AI provider, PageSpeed) are configured as server environment variables, never here. If LEAD_NOTIFICATION_EMAILS is set in the environment, it takes priority over the recipients below.</p>
      <div className="mt-6 space-y-6">
        {GROUPS.map((g) => <SettingsForm key={g.key} group={g.key} title={g.title} fields={g.fields.map((f) => ({ name: f[0], label: f[1], kind: (f[2] ?? "text") as "text" | "textarea" | "list" }))} initial={(values[g.key] ?? {}) as Record<string, unknown>} readOnly={role !== "owner"} />)}
      </div>
    </div>
  );
}
