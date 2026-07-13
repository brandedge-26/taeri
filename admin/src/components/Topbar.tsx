"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAdminStore } from "@/store/adminStore";
import { useAdminAuthStore } from "@/store/adminAuthStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/users":       "Patients",
  "/assessments": "Assessments",
  "/reports":     "Reports",
  "/settings":    "Settings",
};

function useOutsideClick(cb: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cb]);
  return ref;
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  const router = useRouter();

  const initials = user ? user.name.slice(0, 2).toUpperCase() : "TA";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); logout(); router.replace("/login"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAdminStore();

  const title = Object.entries(PAGE_TITLES)
    .filter(([p]) => pathname === p || pathname.startsWith(p + "/"))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center gap-4 px-4 lg:px-6 shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-base font-bold text-gray-900">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ProfileMenu />
      </div>
    </header>
  );
}
