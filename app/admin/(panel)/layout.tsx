import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/admin/actions";
import { ToastProvider } from "@/components/admin/Toast";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const a = await requireAdmin();
  return (
    <ToastProvider><div className="min-h-screen bg-navy-900 text-[15px]">
      <AdminNav name={a.name} role={a.role} signOut={signOut} />
      <div className="lg:pl-64"><div className="mx-auto max-w-6xl p-5 sm:p-8">{children}</div></div>
    </div></ToastProvider>
  );
}
