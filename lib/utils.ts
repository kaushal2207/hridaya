export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export function formatDateTimeIST(d: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(d)) + " IST";
}

export function escapeHtml(s: unknown) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

export function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function safeHref(u: string | null | undefined) {
  if (!u) return null;
  try { const url = new URL(u); return ["http:", "https:"].includes(url.protocol) ? url.toString() : null; } catch { return null; }
}

export function whatsappLink(num: string | null | undefined, text = "Hi HRIDAYA IT SOLUTIONS, I'd like to discuss a project.") {
  const digits = (num || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}
