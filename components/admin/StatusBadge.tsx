const C: Record<string, string> = {
  new: "bg-cyan/15 text-cyan", contacted: "bg-sky-400/15 text-sky-200", in_progress: "bg-violet/20 text-violet-200", proposal_sent: "bg-indigo-400/20 text-indigo-200",
  converted: "bg-emerald-400/15 text-emerald-300", lost: "bg-slate-400/15 text-slate-300", spam: "bg-rose-400/15 text-rose-300",
};
export const STATUS_LABEL: Record<string, string> = { new: "New", contacted: "Contacted", in_progress: "In progress", proposal_sent: "Proposal sent", converted: "Converted", lost: "Lost", spam: "Spam" };
export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${C[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</span>;
}
