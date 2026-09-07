"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminAxios } from "@/lib/axios";

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

interface Stats {
  totalUsers: number;
  totalAssessments: number;
  riskDistribution: { green: number; yellow: number; red: number };
  recentUsers: {
    _id: string;
    name: string;
    email: string;
    age?: number;
    livingSituation?: string;
    createdAt: string;
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LIVING_LABELS: Record<string, string> = {
  alone: "Lives Alone",
  family: "With Family",
  spouse: "With Spouse",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} style={style} />;
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

function DonutChart({ green, yellow, red, total }: { green: number; yellow: number; red: number; total: number }) {
  const r = 52;
  const cx = 68;
  const cy = 68;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: green,  color: "#10B981" },
    { value: yellow, color: "#F59E0B" },
    { value: red,    color: "#EF4444" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct    = total > 0 ? seg.value / total : 0;
    const dash   = pct * circumference;
    const gap    = circumference - dash;
    const rotate = (offset / total) * 360 - 90;
    offset += seg.value;
    return { ...seg, dash, gap, rotate };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="136" height="136" viewBox="0 0 136 136">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="13" />
          {arcs.map((arc, i) =>
            arc.value > 0 ? (
              <circle
                key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={arc.color} strokeWidth="13"
                strokeDasharray={`${arc.dash - 2} ${arc.gap + 2}`}
                strokeDashoffset={0} strokeLinecap="round"
                transform={`rotate(${arc.rotate} ${cx} ${cy})`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            ) : null
          )}
          <text x={cx} y={cy - 7} textAnchor="middle" style={{ fontSize: 21, fontWeight: 700, fill: "#111827" }}>
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 10, fill: "#9CA3AF" }}>
            total
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {[
          { label: "Low Risk",  count: green,  color: "#10B981", pill: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
          { label: "Moderate",  count: yellow, color: "#F59E0B", pill: "bg-amber-50 text-amber-700 ring-amber-100"       },
          { label: "High Risk", count: red,    color: "#EF4444", pill: "bg-red-50 text-red-700 ring-red-100"             },
        ].map(({ label, count, color, pill }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-500 flex-1">{label}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${pill}`}>{count}</span>
              <span className="text-[11px] text-gray-400 w-7 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [atRisk, setAtRisk] = useState<AtRiskPatient[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(true);

  function loadData() {
    setLoading(true);
    setAtRiskLoading(true);
    adminAxios.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
    adminAxios.get("/admin/at-risk-patients").then((r) => setAtRisk(r.data.patients ?? [])).catch(() => {}).finally(() => setAtRiskLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  const riskTotal = stats
    ? stats.riskDistribution.green + stats.riskDistribution.yellow + stats.riskDistribution.red
    : 0;

  const avgPerUser =
    stats && stats.totalUsers > 0
      ? (stats.totalAssessments / stats.totalUsers).toFixed(1)
      : "0.0";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-2 transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: "Total Persons",
            value: stats?.totalUsers ?? "—",
            sub: "registered users",
            href: "/users",
            accent: "border-blue-500",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
          },
          {
            title: "Assessments",
            value: stats?.totalAssessments ?? "—",
            sub: `avg ${avgPerUser} per person`,
            href: "/assessments",
            accent: "border-violet-500",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-500",
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
          },
          {
            title: "Low Risk",
            value: stats?.riskDistribution.green ?? "—",
            sub: riskTotal > 0 ? `${Math.round((stats!.riskDistribution.green / riskTotal) * 100)}% of assessed` : "no data yet",
            accent: "border-emerald-500",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
          },
          {
            title: "High Risk",
            value: stats?.riskDistribution.red ?? "—",
            sub: riskTotal > 0 ? `${Math.round((stats!.riskDistribution.red / riskTotal) * 100)}% of assessed` : "no data yet",
            accent: "border-red-500",
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
          },
        ].map((card) => {
          const inner = (
            <div className={`group bg-white rounded-2xl border border-gray-200 border-t-2 ${card.accent} p-4 hover:shadow-sm transition-all duration-200 ${card.href ? "cursor-pointer" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <svg className={`w-4 h-4 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    {card.icon}
                  </svg>
                </div>
                {card.href && (
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-7 w-14 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{card.value}</p>
                  <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">{card.title}</p>
                  {card.sub && <p className="text-[11px] text-gray-300 mt-0.5">{card.sub}</p>}
                </>
              )}
            </div>
          );
          return card.href ? <Link key={card.title} href={card.href}>{inner}</Link> : <div key={card.title}>{inner}</div>;
        })}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Donut Chart — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Fall Risk Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Across all completed assessments</p>
            </div>
            {!loading && riskTotal > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                {riskTotal} assessed
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="w-[136px] h-[136px] rounded-full shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          ) : riskTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No assessments yet</p>
            </div>
          ) : (
            <DonutChart
              green={stats!.riskDistribution.green}
              yellow={stats!.riskDistribution.yellow}
              red={stats!.riskDistribution.red}
              total={riskTotal}
            />
          )}
        </div>

        {/* Quick Summary — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Quick Summary</h3>
            <p className="text-xs text-gray-400 mt-0.5">Platform at a glance</p>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {[
              {
                label: "Persons with assessments",
                value: loading ? null : riskTotal,
                total: loading ? null : stats?.totalUsers ?? 0,
                color: "bg-blue-500",
              },
              {
                label: "Moderate risk persons",
                value: loading ? null : stats?.riskDistribution.yellow ?? 0,
                total: loading ? null : riskTotal,
                color: "bg-amber-400",
              },
              {
                label: "Avg assessments / person",
                value: loading ? null : parseFloat(avgPerUser),
                total: null,
                color: "bg-violet-500",
                isAvg: true,
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  {item.value !== null && (
                    <span className="text-xs font-bold text-gray-800 tabular-nums">
                      {item.isAvg ? item.value : `${item.value}${item.total !== null ? ` / ${item.total}` : ""}`}
                    </span>
                  )}
                </div>
                {loading ? (
                  <Skeleton className="h-1.5 w-full rounded-full" />
                ) : (
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{
                        width: item.isAvg
                          ? `${Math.min((parseFloat(avgPerUser) / 5) * 100, 100)}%`
                          : item.total && item.total > 0
                          ? `${Math.round(((item.value as number) / item.total) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Link row */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <Link href="/assessments" className="text-xs font-semibold text-primary hover:underline">
              View all assessments
            </Link>
            <Link href="/users" className="text-xs font-semibold text-primary hover:underline">
              View persons
            </Link>
          </div>
        </div>

      </div>

      {/* ── At-Risk Patients Report ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">At-Risk Persons</h3>
            <p className="text-xs text-gray-400 mt-0.5">Persons with Moderate or High fall risk</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              Moderate
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              High
            </span>
          </div>
        </div>

        {/* Table head */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Person</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Risk Level</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Avg Score</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Assessments</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 text-right">Last Assessment</span>
        </div>

        {atRiskLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
                <Skeleton className="h-5 w-16 hidden sm:block rounded-full" />
                <Skeleton className="h-3 w-12 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : atRisk.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">All clear</p>
            <p className="text-xs text-gray-400">No persons with moderate or high risk</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {atRisk.map((p) => {
              const ac = avatarColor(p.name);
              const isHigh = p.riskLevel === "red";
              return (
                <div key={p._id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  {/* Patient */}
                  <div className="col-span-12 sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    </div>
                  </div>
                  {/* Risk badge */}
                  <div className="hidden sm:flex col-span-2 items-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isHigh
                        ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                        : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHigh ? "bg-red-500" : "bg-amber-400"}`} />
                      {isHigh ? "High" : "Moderate"}
                    </span>
                  </div>
                  {/* Avg score */}
                  <div className="hidden sm:block col-span-2">
                    <span className={`text-sm font-bold tabular-nums ${isHigh ? "text-red-600" : "text-amber-600"}`}>
                      {p.avgScore}
                    </span>
                  </div>
                  {/* Count */}
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600 tabular-nums">{p.assessmentCount}</span>
                  </div>
                  {/* Last date */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <span className="text-xs text-gray-400">{formatDate(p.lastAssessment)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent Patients ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Recent Persons</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest registered users</p>
          </div>
          <Link
            href="/users"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Table head */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="col-span-5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Person</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Age</span>
          <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Living</span>
          <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 text-right">Joined</span>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
                <Skeleton className="h-2.5 w-14 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : !stats?.recentUsers.length ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">No persons registered yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.map((u) => {
              const ac = avatarColor(u.name);
              return (
                <div key={u._id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  {/* Patient */}
                  <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${ac.bg} ${ac.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  {/* Age */}
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600">{u.age ?? "—"}</span>
                  </div>
                  {/* Living */}
                  <div className="hidden sm:block col-span-3">
                    {u.livingSituation ? (
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                        {LIVING_LABELS[u.livingSituation] ?? u.livingSituation}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                  {/* Joined */}
                  <div className="hidden sm:block col-span-2 text-right">
                    <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
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
