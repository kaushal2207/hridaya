import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail } from "@/lib/http";

/** Admin-only: exchanges an enquiry file id for a 5-minute signed download URL. */
export async function GET(req: Request) {
  const a = await getAdmin();
  if (!a) return fail("Unauthorized", 401);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const { data: f } = await a.db.from("enquiry_files").select("storage_path, original_name").eq("id", id).maybeSingle();
  if (!f) return fail("File not found", 404);
  const { data } = await a.db.storage.from("enquiry-uploads").createSignedUrl(f.storage_path, 300, { download: f.original_name });
  if (!data?.signedUrl) return fail("Could not create download link", 500);
  return NextResponse.redirect(data.signedUrl);
}
