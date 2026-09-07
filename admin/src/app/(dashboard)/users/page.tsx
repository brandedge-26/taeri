"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminAxios } from "@/lib/axios";

interface UserAssessment {
  _id: string;
  taskId: string;
  taskName: string;
  date: string;
  weekNumber: number;
  frequency: string;
  duration: string;
  stability: string;
  physicalDemand: number;
  complexity: number;
  psychological: number;
  neck: number;
  arm: number;
  wrist: number;
  back: number;
  leg: number;
  posture: number;
  handling: number;
  rawScore: number;
  adjustmentFactor: number;
  finalScore: number;
  riskLevel: "green" | "yellow" | "red";
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  livingSituation?: string;
  provider: string;
  createdAt: string;
  assessmentCount: number;
  avgScore: number | null;
  overallRisk: "green" | "yellow" | "red" | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const LIVING_LABELS: Record<string, string> = {
  alone: "Lives Alone",
  family: "With Family",
  spouse: "With Spouse",
};

const RISK_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  green:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", label: "Low Risk"  },
  yellow: { badge: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",   label: "Moderate"  },
  red:    { badge: "bg-red-50 text-red-600 border-red-200",             dot: "bg-red-400",     label: "High Risk" },
};

const STABILITY_LABELS: Record<string, string> = {
  very_stable:       "Very Stable",
  somewhat_unsteady: "Somewhat Unsteady",
  very_unsteady:     "Very Unsteady",
};

const AVATAR_COLORS = [
  { bg: "bg-blue-100",    text: "text-blue-600"    },
  { bg: "bg-violet-100",  text: "text-violet-600"  },
  { bg: "bg-pink-100",    text: "text-pink-600"    },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100",   text: "text-amber-600"   },
  { bg: "bg-red-100",     text: "text-red-600"     },
  { bg: "bg-indigo-100",  text: "text-indigo-600"  },
  { bg: "bg-teal-100",    text: "text-teal-600"    },
  { bg: "bg-orange-100",  text: "text-orange-600"  },
  { bg: "bg-cyan-100",    text: "text-cyan-600"    },
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Assessments Drawer ────────────────────────────────────────────────────────

function AssessmentsDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const [assessments, setAssessments] = useState<UserAssessment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState<string | null>(null);

  useEffect(() => {
    adminAxios.get(`/admin/users/${user._id}/assessments`)
      .then((res) => setAssessments(res.data.assessments ?? []))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [user._id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const ac = avatarColor(user.name);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-[61] w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className={`w-9 h-9 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-sm font-bold shrink-0`}>
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{user.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-gray-400">No assessments yet.</p>
            </div>
          ) : (
            assessments.map((a) => {
              const rs   = RISK_STYLES[a.riskLevel];
              const open = expanded === a._id;
              return (
                <div key={a._id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpanded(open ? null : a._id)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-100/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-800">{a.taskName}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rs.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                          {rs.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Week #{a.weekNumber} · {formatDate(a.date)}
                      </p>
                    </div>
                    {/* Score + chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-bold text-primary tabular-nums">{a.finalScore}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                      {/* Score grid */}
                      <div className="grid grid-cols-3 gap-2 pt-3">
                        {[
                          { label: "Final Score",  value: a.finalScore,       color: "text-primary" },
                          { label: "Raw Score",    value: a.rawScore,          color: "text-gray-700" },
                          { label: "Adj. Factor",  value: a.adjustmentFactor, color: "text-gray-700" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-white rounded-xl px-3 py-2 text-center border border-gray-100">
                            <p className={`text-lg font-bold ${color}`}>{value}</p>
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Task info */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Task Info</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: "Frequency",  value: a.frequency },
                            { label: "Duration",   value: `${a.duration} min` },
                            { label: "Stability",  value: STABILITY_LABELS[a.stability] ?? a.stability },
                            { label: "Task Date",  value: formatDate(a.date) },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                              <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-scores */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Sub-scores</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: "Physical Demand", value: a.physicalDemand },
                            { label: "Complexity",      value: a.complexity },
                            { label: "Psychological",   value: a.psychological },
                            { label: "Neck",            value: a.neck },
                            { label: "Arm",             value: a.arm },
                            { label: "Wrist",           value: a.wrist },
                            { label: "Back",            value: a.back },
                            { label: "Leg",             value: a.leg },
                            { label: "Posture Total",   value: a.posture },
                            { label: "Handling",        value: a.handling },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <span className="text-[10px] text-gray-500">{label}</span>
                              <span className="text-xs font-bold text-gray-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

function DeleteModal({
  user, onClose, onConfirm, deleting,
}: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !deleting) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, deleting]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current && !deleting) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Icon */}
        <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Delete Person</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{user.name}</span>?
            <br />
            <span className="text-xs text-red-400 mt-1 block">
              This will also delete all {user.assessmentCount} assessment{user.assessmentCount !== 1 ? "s" : ""}. This action cannot be undone.
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Page <span className="font-semibold text-gray-700">{page}</span> of{" "}
        <span className="font-semibold text-gray-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                ${p === page
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [deleteUser, setDeleteUser]   = useState<User | null>(null);
  const [drawerUser, setDrawerUser]   = useState<User | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const closeDrawer = useCallback(() => setDrawerUser(null), []);

  useEffect(() => {
    adminAxios.get("/admin/users")
      .then((res) => setUsers(res.data.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 on search change
  useEffect(() => { setPage(1); }, [search]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/admin/users/${deleteUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteUser._id));
      setDeleteUser(null);
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Persons</h2>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} total persons</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ color: '#111827' }}
            className="w-full sm:w-72 rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Patients */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total Persons</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-400 mt-1">Registered users</p>
          </div>
          {/* With Assessments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">With Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.assessmentCount > 0).length}</p>
            <p className="text-xs text-gray-400 mt-1">Have taken at least one</p>
          </div>
          {/* Low Risk */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Low Risk</p>
            <p className="text-2xl font-bold text-emerald-600">{users.filter(u => u.overallRisk === "green").length}</p>
            <p className="text-xs text-gray-400 mt-1">Score below 1.6</p>
          </div>
          {/* High Risk */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">High Risk</p>
            <p className="text-2xl font-bold text-red-500">{users.filter(u => u.overallRisk === "red").length}</p>
            <p className="text-xs text-gray-400 mt-1">Score above 5.0</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm text-gray-400">{search ? "No users match your search." : "No users yet."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Person</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Age</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Living</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Assessments</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Joined</th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((u) => {
                    const ac = avatarColor(u.name);
                    return (
                      <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {initials(u.name)}
                            </div>
                            <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">{u.name}</span>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-5 py-3.5 text-xs text-gray-500 hidden md:table-cell">{u.email}</td>
                        {/* Age */}
                        <td className="px-5 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{u.age ?? "—"}</td>
                        {/* Living */}
                        <td className="px-5 py-3.5 text-xs text-gray-500 hidden lg:table-cell">
                          {u.livingSituation ? LIVING_LABELS[u.livingSituation] ?? u.livingSituation : "—"}
                        </td>
                        {/* Assessments */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {u.assessmentCount} assessments
                          </span>
                        </td>
                        {/* Joined */}
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap hidden md:table-cell">
                          {formatDate(u.createdAt)}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View profile */}
                            <Link
                              href={`/users/${u._id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="View profile"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </Link>
                            {/* Assessments drawer */}
                            <button
                              onClick={() => setDrawerUser(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                              title="View assessments"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteUser(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete user"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {/* Assessments Drawer */}
      {drawerUser && <AssessmentsDrawer user={drawerUser} onClose={closeDrawer} />}

      {/* Modals */}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
