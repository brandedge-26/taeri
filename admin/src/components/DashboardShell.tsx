"use client";
import { useAdminStore } from "@/store/adminStore";
import Topbar from "@/components/Topbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAdminStore((s) => s.sidebarCollapsed);
  return (
    <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">{children}</main>
    </div>
  );
}
