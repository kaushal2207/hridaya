import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (hasServiceRole && /^[0-9a-f]{32}$/.test(token))
    await adminClient().from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }).eq("unsubscribe_token", token);
  return new NextResponse(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title><body style="font-family:system-ui;background:#080D1B;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:28rem;padding:2rem;text-align:center"><h1 style="font-size:1.5rem">You’re unsubscribed</h1><p style="color:#9fb0d9">You won’t receive newsletter emails from HRIDAYA IT SOLUTIONS any more.</p><a href="/" style="color:#00D4FF">Back to the website</a></div></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
