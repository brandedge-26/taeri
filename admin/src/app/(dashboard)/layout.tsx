import Sidebar from "@/components/Sidebar";
import DashboardShell from "@/components/DashboardShell";
import AdminAuthProvider from "@/components/AdminAuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="flex h-full">
        <Sidebar />
        <DashboardShell>{children}</DashboardShell>
      </div>
    </AdminAuthProvider>
  );
}
