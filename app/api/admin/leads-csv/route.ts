import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail } from "@/lib/http";

const esc = (v: unknown) => {
  let s = Array.isArray(v) ? v.join("; ") : typeof v === "object" && v ? JSON.stringify(v) : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // CSV formula-injection guard
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const a = await getAdmin();
  if (!a) return fail("Unauthorized", 401);
  const url = new URL(req.url);
  let q = a.db.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5000);
  const status = url.searchParams.get("status"); if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return fail(error.message, 500);
  const cols = ["created_at", "status", "service_name", "full_name", "business_name", "email", "phone", "city", "website_url", "budget_range", "expected_start_date", "project_description", "additional_requirements", "answers", "admin_email_status", "id"];
  const csv = [cols.join(","), ...(data ?? []).map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(","))].join("\n");
  return new NextResponse("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hridaya-leads-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
