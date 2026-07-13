"use client";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-4">
      {/* Account Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() ?? "TA"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name ?? "Admin"}</p>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">About</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Platform</span>
            <span className="font-medium text-gray-900">TAERI Admin</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Full Name</span>
            <span className="font-medium text-gray-900">Task Assessment for Ease, Risk & Independence</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Version</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-red-600 mb-4">Sign Out</h2>
        <p className="text-xs text-gray-400 mb-4">This will end your current admin session.</p>
        <button
          onClick={() => { logout(); router.replace("/login"); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
