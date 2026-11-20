import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/admin-resources";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function Edit({ params }: { params: { resource: string; id: string } }) {
  const r = getResource(params.resource);
  if (!r) notFound();
  const { db, role } = await requireAdmin();
  const id = decodeURIComponent(params.id);
  const isNew = id === "new";
  let row: Record<string, unknown> = {};
  if (!isNew) {
    const { data } = await db.from(r.table).select("*").eq(r.pk ?? "id", id).maybeSingle();
    if (!data) notFound();
    row = data;
  }
  // Options for relations and current many-to-many selections
  const options: Record<string, { value: string; label: string }[]> = {};
  for (const f of r.fields.filter((x) => x.relation)) {
    const { data } = await db.from(f.relation!.table).select(`id, ${f.relation!.label}`).order(f.relation!.order ?? f.relation!.label).limit(1000);
    options[f.name] = ((data ?? []) as unknown as Record<string, string>[]).map((x) => ({ value: x.id, label: x[f.relation!.label] }));
    if (f.join && !isNew) {
      const { data: j } = await db.from(f.join.table).select(f.join.other).eq(f.join.self, id);
      row[f.name] = ((j ?? []) as unknown as Record<string, string>[]).map((x) => x[f.join!.other]);
    }
  }
  return (
    <div>
      <Link href={`/admin/content/${r.key}`} className="text-sm text-cyan">← {r.title}</Link>
      <h1 className="mt-3 !text-2xl sm:!text-3xl">{isNew ? `New ${r.singular}` : `Edit ${r.singular}`}</h1>
      {r.note && <p className="mt-3 max-w-3xl text-sm text-slate-400">{r.note}</p>}
      <ResourceForm resourceKey={r.key} id={isNew ? null : id} initial={row} options={options} readOnly={role === "viewer"}
        publicUrl={!isNew && r.publicPath && row.slug ? r.publicPath(row) : null} />
    </div>
  );
}
