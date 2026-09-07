"use client";
import { useEffect, useRef, useState } from "react";
import { adminAxios } from "@/lib/axios";

interface Assessment {
  _id: string;
  taskName: string;
  userId: { name: string; email: string } | null;
  date: string;
  createdAt: string;
  weekNumber: number;
  // inputs
  frequency: string;
  duration: string;
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
  stability: string;
  // scores
  rawScore: number;
  adjustmentFactor: number;
  finalScore: number;
  riskLevel: "green" | "yellow" | "red";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const RISK_STYLES: Record<string, string> = {
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  red:    "bg-red-50 text-red-600 border-red-200",
};
const RISK_LABELS: Record<string, string> = {
  green: "Low Risk", yellow: "Moderate", red: "High Risk",
};
const RISK_DOT: Record<string, string> = {
  green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-red-400",
};
const STABILITY_LABELS: Record<string, string> = {
  very_stable:       "Very Stable",
  somewhat_unsteady: "Somewhat Unsteady",
  very_unsteady:     "Very Unsteady",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, iconBg, icon, loading }: {
  label: string; value: string | number; sub?: string;
  iconBg: string; icon: React.ReactNode; loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <>
              <Sk className="h-5 w-14 mb-1" />
              <Sk className="h-3 w-20" />
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
              {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ a, onClose }: { a: Assessment; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const riskStyle = RISK_STYLES[a.riskLevel] ?? "bg-gray-100 text-gray-500 border-gray-200";

  const scoreRows = [
    { label: "Physical Demand",   value: a.physicalDemand },
    { label: "Complexity",        value: a.complexity },
    { label: "Psychological",     value: a.psychological },
    { label: "Neck Posture",      value: a.neck },
    { label: "Arm Posture",       value: a.arm },
    { label: "Wrist Posture",     value: a.wrist },
    { label: "Back Posture",      value: a.back },
    { label: "Leg Posture",       value: a.leg },
    { label: "Posture Total",     value: a.posture },
    { label: "Handling",          value: a.handling },
  ];

  return (
    <div
      ref={ref}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-800">{a.taskName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {a.userId?.name ?? "Unknown"} · Week #{a.weekNumber} · {formatDate(a.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${riskStyle}`}>
              {RISK_LABELS[a.riskLevel]}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Final Score",   value: a.finalScore,        color: "text-primary" },
              { label: "Raw Score",     value: a.rawScore,           color: "text-gray-700" },
              { label: "Adj. Factor",   value: a.adjustmentFactor,  color: "text-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Task Info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Task Info</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Frequency",   value: a.frequency },
                { label: "Duration",    value: `${a.duration} min` },
                { label: "Stability",   value: STABILITY_LABELS[a.stability] ?? a.stability },
                { label: "Task Date",   value: formatDate(a.date) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-scores */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Sub-scores</p>
            <div className="grid grid-cols-2 gap-2">
              {scoreRows.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User info */}
          {a.userId && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Person</p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {a.userId.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{a.userId.name}</p>
                  <p className="text-xs text-gray-400">{a.userId.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ a, onClose, onConfirm, deleting }: {
  a: Assessment; onClose: () => void; onConfirm: () => void; deleting: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && !deleting) onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, deleting]);

  return (
    <div
      ref={ref}
      onClick={(e) => { if (e.target === ref.current && !deleting) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Delete Assessment</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Delete assessment for{" "}
            <span className="font-semibold text-gray-800">{a.taskName}</span>?
            <span className="block text-xs text-red-400 mt-1">This action cannot be undone.</span>
          </p>
        </div>
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
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Deleting…</>
            ) : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Page <span className="font-semibold text-gray-700">{page}</span> of{" "}
        <span className="font-semibold text-gray-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                ${p === page ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [riskFilter, setRiskFilter]   = useState("all");
  const [page, setPage]               = useState(1);
  const [detailA, setDetailA]         = useState<Assessment | null>(null);
  const [deleteA, setDeleteA]         = useState<Assessment | null>(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    adminAxios.get("/admin/assessments")
      .then((res) => setAssessments(res.data.assessments ?? []))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, riskFilter]);

  const filtered = assessments.filter((a) => {
    const matchSearch =
      a.taskName.toLowerCase().includes(search.toLowerCase()) ||
      (a.userId?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || a.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const total    = assessments.length;
  const avgScore = total > 0
    ? (assessments.reduce((s, a) => s + a.finalScore, 0) / total).toFixed(1)
    : "0";
  const lowRisk  = assessments.filter((a) => a.riskLevel === "green").length;
  const modRisk  = assessments.filter((a) => a.riskLevel === "yellow").length;
  const highRisk = assessments.filter((a) => a.riskLevel === "red").length;

  async function handleDelete() {
    if (!deleteA) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/admin/assessments/${deleteA._id}`);
      setAssessments((prev) => prev.filter((a) => a._id !== deleteA._id));
      setDeleteA(null);
    } catch {
      // keep modal open
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Assessments</h2>
        <p className="text-sm text-gray-400 mt-0.5">{total} total assessments recorded</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total" value={total} sub="all assessments" loading={loading}
          iconBg="bg-violet-50"
          icon={<svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <StatCard
          label="Avg Score" value={avgScore} sub="task exposure score" loading={loading}
          iconBg="bg-blue-50"
          icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard
          label="Low Risk" value={lowRisk}
          sub={total > 0 ? `${Math.round((lowRisk / total) * 100)}% of total` : "—"}
          loading={loading} iconBg="bg-emerald-50"
          icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="High Risk" value={highRisk}
          sub={total > 0 ? `${Math.round((highRisk / total) * 100)}% of total` : "—"}
          loading={loading} iconBg="bg-red-50"
          icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { val: "all",    label: "All" },
            { val: "green",  label: `Low Risk (${lowRisk})` },
            { val: "yellow", label: `Moderate (${modRisk})` },
            { val: "red",    label: `High Risk (${highRisk})` },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setRiskFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                riskFilter === val
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {val !== "all" && (
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${RISK_DOT[val]}`} />
              )}
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search task or person…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ color: '#111827' }}
            className="w-full sm:w-64 rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white transition-all"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">
              {search || riskFilter !== "all" ? "No assessments match your filters." : "No assessments yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Task</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Person</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Score</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Risk</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Stability</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Week</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Date</th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800 text-xs whitespace-nowrap max-w-[160px] truncate">
                        {a.taskName}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="font-medium text-gray-700 text-xs">{a.userId?.name ?? "Unknown"}</p>
                        <p className="text-gray-400 text-[11px]">{a.userId?.email ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="font-bold text-gray-900 text-xs">{a.finalScore}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${RISK_STYLES[a.riskLevel] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[a.riskLevel] ?? "bg-gray-400"}`} />
                          {RISK_LABELS[a.riskLevel] ?? a.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 hidden lg:table-cell">
                        {STABILITY_LABELS[a.stability] ?? a.stability}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-0.5">
                          Week #{a.weekNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap hidden md:table-cell">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDetailA(a)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteA(a)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete assessment"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {/* Modals */}
      {detailA && <DetailModal a={detailA} onClose={() => setDetailA(null)} />}
      {deleteA && (
        <DeleteModal
          a={deleteA}
          onClose={() => setDeleteA(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
