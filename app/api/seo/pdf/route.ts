import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";
import { renderAuditPdf } from "@/lib/seo/pdf";
import { fail } from "@/lib/http";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!hasServiceRole || !/^[0-9a-f]{24}$/.test(token)) return fail("Report not found", 404);
  const { data } = await adminClient().from("seo_reports").select("*").eq("share_token", token).eq("tool", "audit").gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!data) return fail("Report not found or expired", 404);
  const bytes = await renderAuditPdf(data);
  let host = "website"; try { host = new URL(data.target_url).hostname; } catch { /* keep default */ }
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="seo-audit-${host}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
