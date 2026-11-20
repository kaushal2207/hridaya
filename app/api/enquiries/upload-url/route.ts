import { randomUUID } from "crypto";
import { z } from "zod";
import { ALLOWED_UPLOAD_MIME } from "@/lib/forms";
import { fail, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

const body = z.object({ name: z.string().min(1).max(200), mime: z.string().max(120), size: z.number().int().positive() });

/** Issues a one-time signed upload URL into the private bucket so large files never pass through the server. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  if (!hasServiceRole) return fail("File uploads are not configured yet", 503);
  if (!(await rateLimit("upload", 600, 20))) return fail("Too many uploads. Please try again in a few minutes.", 429);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid file");
  const { name, mime, size } = parsed.data;
  if (!ALLOWED_UPLOAD_MIME.includes(mime)) return fail("This file type isn't allowed. Use PDF, JPG, PNG, WebP, DOC, DOCX or ZIP.");
  if (size > 10 * 1024 * 1024) return fail("Files must be 10 MB or smaller");
  const safe = name.replace(/[^\w.\- ]+/g, "_").slice(-100) || "file";
  const path = `pending/${randomUUID()}/${safe}`;
  const { data, error } = await adminClient().storage.from("enquiry-uploads").createSignedUploadUrl(path);
  if (error || !data) return fail("Could not prepare upload", 500);
  return json({ ok: true, path, token: data.token });
}
