"use client";
import { useEffect, useState, useMemo } from "react";
import { adminAxios } from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AtRiskPatient {
  _id: string;
  name: string;
  email: string;
  age?: number;
  livingSituation?: string;
  assessmentCount: number;
  avgScore: number;
  riskLevel: "yellow" | "red";
  lastAssessment: string;
}

interface Assessment {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  taskName: string;
  finalScore: number;
  riskLevel: "green" | "yellow" | "red";
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "bg-blue-100",    text: "text-blue-600"    },
  { bg: "bg-violet-100",  text: "text-violet-600"  },
  { bg: "bg-pink-100",    text: "text-pink-600"    },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100",   text: "text-amber-600"   },
  { bg: "bg-indigo-100",  text: "text-indigo-600"  },
  { bg: "bg-teal-100",    text: "text-teal-600"    },
  { bg: "bg-orange-100",  text: "text-orange-600"  },
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const LIVING_LABELS: Record<string, string> = {
  alone: "Lives Alone", family: "With Family", spouse: "With Spouse",
};

const RISK_META = {
  green:  { label: "Low",      pill: "bg-emerald-50 text-emerald-600 ring-emerald-100", dot: "bg-emerald-400" },
  yellow: { label: "Moderate", pill: "bg-amber-50 text-amber-600 ring-amber-100",       dot: "bg-amber-400"   },
  red:    { label: "High",     pill: "bg-red-50 text-red-600 ring-red-100",             dot: "bg-red-500"     },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function RiskBadge({ level }: { level: "green" | "yellow" | "red" }) {
  const m = RISK_META[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${m.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(rows: AtRiskPatient[]) {
  const headers = ["Name", "Email", "Age", "Living Situation", "Risk Level", "Avg Score", "Assessments", "Last Assessment"];
  const lines = rows.map((p) => [
    p.name, p.email, p.age ?? "", LIVING_LABELS[p.livingSituation ?? ""] ?? p.livingSituation ?? "",
    p.riskLevel === "red" ? "High" : "Moderate",
    p.avgScore, p.assessmentCount, formatDate(p.lastAssessment),
  ].map((v) => `"${v}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taeri-at-risk-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAssessmentsCSV(rows: Assessment[]) {
  const headers = ["Person", "Email", "Task", "Final Score", "Risk Level", "Date"];
  const lines = rows.map((a) => [
    a.userId?.name ?? "—", a.userId?.email ?? "—", a.taskName,
    a.finalScore, RISK_META[a.riskLevel]?.label ?? a.riskLevel, formatDate(a.createdAt),
  ].map((v) => `"${v}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taeri-assessments-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Page ──────────────────────────────────────────────────────────────────────

type RiskFilter = "all" | "red" | "yellow";
type AssessRiskFilter = "all" | "green" | "yellow" | "red";

export default function ReportsPage() {
  const [atRisk, setAtRisk] = useState<AtRiskPatient[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(true);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessLoading, setAssessLoading] = useState(true);

  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [assessRiskFilter, setAssessRiskFilter] = useState<AssessRiskFilter>("all");
  const [search, setSearch] = useState("");
  const [assessSearch, setAssessSearch] = useState("");

  useEffect(() => {
    adminAxios.get("/admin/at-risk-patients")
      .then((r) => setAtRisk(r.data.patients ?? []))
      .catch(() => {})
      .finally(() => setAtRiskLoading(false));

    adminAxios.get("/admin/assessments")
      .then((r) => setAssessments(r.data.assessments ?? []))
      .catch(() => {})
      .finally(() => setAssessLoading(false));
  }, []);

  // filtered at-risk
  const filteredAtRisk = useMemo(() => {
    return atRisk.filter((p) => {
      if (riskFilter !== "all" && p.riskLevel !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [atRisk, riskFilter, search]);

  // filtered assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (assessRiskFilter !== "all" && a.riskLevel !== assessRiskFilter) return false;
      if (assessSearch) {
        const q = assessSearch.toLowerCase();
        return (
          (a.userId?.name ?? "").toLowerCase().includes(q) ||
          (a.userId?.email ?? "").toLowerCase().includes(q) ||
          a.taskName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assessments, assessRiskFilter, assessSearch]);

  const highCount = atRisk.filter((p) => p.riskLevel === "red").length;
  const modCount  = atRisk.filter((p) => p.riskLevel === "yellow").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fall risk analysis across all persons</p>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "At-Risk Persons", value: atRiskLoading ? "—" : atRisk.length, accent: "border-t-orange-400", icon: "text-orange-500", bg: "bg-orange-50",
            path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
          { label: "High Risk", value: atRiskLoading ? "—" : highCount, accent: "border-t-red-500", icon: "text-red-500", bg: "bg-red-50",
            path: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Moderate Risk", value: atRiskLoading ? "—" : modCount, accent: "border-t-amber-400", icon: "text-amber-500", bg: "bg-amber-50",
            path: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" },
          { label: "Total Assessments", value: assessLoading ? "—" : assessments.length, accent: "border-t-violet-500", icon: "text-violet-500", bg: "bg-violet-50",
            path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
        ].map((c) => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-200 border-t-2 ${c.accent} p-4`}>
            <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <svg className={`w-4 h-4 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.path} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{c.value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── At-Risk Patients Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">At-Risk Persons</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filteredAtRisk.length} persons shown</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search person..."
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-40"
              />
            </div>
            {/* Risk filter */}
            {(["all", "red", "yellow"] as RiskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  riskFilter === f
                    ? "bg-primary text-white"
                    : "bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f === "all" ? "All" : f === "red" ? "High" : "Moderate"}
              </button>
            ))}
            {/* Export */}
            <button
              onClick={() => exportCSV(filteredAtRisk)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Column heads */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
          {["Person", "Risk", "Avg Score", "Age", "Living", "Assessments", "Last Assessment"].map((h, i) => (
            <span key={h} className={`text-[11px] font-semibold uppercase tracking-wide text-gray-400 ${
              i === 0 ? "col-span-3" : i === 1 ? "col-span-2" : i === 6 ? "col-span-2 text-right" : "col-span-1"
            }`}>{h}</span>
          ))}
        </div>

        {atRiskLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-36" /></div>
                <Skeleton className="h-5 w-16 hidden sm:block rounded-full" />
                <Skeleton className="h-3 w-10 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : filteredAtRisk.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">No persons found</p>
            <p className="text-xs text-gray-400">Try changing filters or search query</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredAtRisk.map((p) => {
              const ac = avatarColor(p.name);
              return (
                <div key={p._id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-gray-50/40 transition-colors">
                  {/* Patient */}
                  <div className="col-span-12 sm:col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    </div>
                  </div>
                  {/* Risk */}
                  <div className="hidden sm:flex col-span-2"><RiskBadge level={p.riskLevel} /></div>
                  {/* Avg score */}
                  <div className="hidden sm:block col-span-1">
                    <span className={`text-sm font-bold tabular-nums ${p.riskLevel === "red" ? "text-red-600" : "text-amber-600"}`}>
                      {p.avgScore}
                    </span>
                  </div>
                  {/* Age */}
                  <div className="hidden sm:block col-span-1">
                    <span className="text-sm text-gray-600">{p.age ?? "—"}</span>
                  </div>
                  {/* Living */}
                  <div className="hidden sm:block col-span-2">
                    {p.livingSituation ? (
                      <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                        {LIVING_LABELS[p.livingSituation] ?? p.livingSituation}
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  {/* Count */}
                  <div className="hidden sm:block col-span-1">
                    <span className="text-sm text-gray-600 tabular-nums">{p.assessmentCount}</span>
                  </div>
                  {/* Last */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <span className="text-xs text-gray-400">{formatDate(p.lastAssessment)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── All Assessments Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Assessment History</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filteredAssessments.length} records shown</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={assessSearch}
                onChange={(e) => setAssessSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-36"
              />
            </div>
            {/* Risk filter */}
            {(["all", "red", "yellow", "green"] as AssessRiskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setAssessRiskFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  assessRiskFilter === f
                    ? "bg-primary text-white"
                    : "bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f === "all" ? "All" : RISK_META[f].label}
              </button>
            ))}
            {/* Export */}
            <button
              onClick={() => exportAssessmentsCSV(filteredAssessments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Column heads */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
          <span className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Person</span>
          <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Task</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Risk</span>
          <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Score</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 text-right">Date</span>
        </div>

        {assessLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-36" /></div>
                <Skeleton className="h-5 w-16 hidden sm:block rounded-full" />
                <Skeleton className="h-3 w-10 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">No assessments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredAssessments.map((a) => {
              const name = a.userId?.name ?? "Deleted User";
              const ac = avatarColor(name);
              return (
                <div key={a._id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-gray-50/40 transition-colors">
                  {/* Patient */}
                  <div className="col-span-12 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{a.userId?.email ?? "—"}</p>
                    </div>
                  </div>
                  {/* Task */}
                  <div className="hidden sm:block col-span-3">
                    <span className="text-sm text-gray-600 truncate">{a.taskName}</span>
                  </div>
                  {/* Risk */}
                  <div className="hidden sm:flex col-span-2"><RiskBadge level={a.riskLevel} /></div>
                  {/* Score */}
                  <div className="hidden sm:block col-span-1">
                    <span className="text-sm font-bold tabular-nums text-gray-700">{a.finalScore?.toFixed(2) ?? "—"}</span>
                  </div>
                  {/* Date */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <span className="text-xs text-gray-400">{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
