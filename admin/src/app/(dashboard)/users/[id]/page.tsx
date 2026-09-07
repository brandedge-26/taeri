"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { adminAxios } from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  age?: number;
  livingSituation?: string;
  provider: string;
  createdAt: string;
  assessmentCount: number;
  avgScore: number | null;
  lowestScore: number | null;
  highestScore: number | null;
  lastAssessmentDate: string | null;
  overallRisk: "green" | "yellow" | "red" | null;
}

interface Assessment {
  _id: string;
  taskId: string;
  taskName: string;
  date: string;
  createdAt: string;
  weekNumber: number;
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
  rawScore: number;
  adjustmentFactor: number;
  finalScore: number;
  riskLevel: "green" | "yellow" | "red";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LIVING_LABELS: Record<string, string> = {
  alone: "Lives Alone",
  family: "With Family",
  spouse: "With Spouse",
};

const RISK_META = {
  green:  { label: "Low Risk",  pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", bar: "bg-emerald-400" },
  yellow: { label: "Moderate",  pill: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",   bar: "bg-amber-400"   },
  red:    { label: "High Risk", pill: "bg-red-50 text-red-600 border-red-200",             dot: "bg-red-500",     bar: "bg-red-500"     },
};

const STABILITY_LABELS: Record<string, string> = {
  very_stable: "Very Stable",
  somewhat_unsteady: "Somewhat Unsteady",
  very_unsteady: "Very Unsteady",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function scoreToRisk(s: number): "green" | "yellow" | "red" {
  if (s < 1.6) return "green";
  if (s <= 5.0) return "yellow";
  return "red";
}

// ── Avatar Colors ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
  { bg: "bg-teal-100", text: "text-teal-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function RiskTrendChart({ data }: { data: { date: string; score: number }[] }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-sm text-gray-400">No assessment data</div>
  );
  if (data.length === 1) {
    return (
      <div className="flex items-center justify-center h-32 flex-col gap-1">
        <span className="text-2xl font-bold text-primary">{data[0].score}</span>
        <span className="text-xs text-gray-400">Only 1 assessment</span>
      </div>
    );
  }

  const W = 560, H = 180;
  const PAD = { top: 28, right: 24, bottom: 36, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const rawMax = Math.max(...data.map((d) => d.score));
  const rawMin = Math.min(...data.map((d) => d.score));
  const maxY = Math.ceil(rawMax * 1.15) || 1;
  const minY = 0;

  // Generate ~5 clean y-axis ticks
  const tickStep = Math.ceil(maxY / 5) || 1;
  const yTicks = Array.from({ length: Math.floor(maxY / tickStep) + 1 }, (_, i) => i * tickStep);

  const xScale = (i: number) => PAD.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const yScale = (v: number) => PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.score), ...d }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left} y1={yScale(tick).toFixed(1)}
            x2={W - PAD.right} y2={yScale(tick).toFixed(1)}
            stroke="#f3f4f6" strokeWidth={1}
          />
          <text x={PAD.left - 8} y={yScale(tick)} textAnchor="end" dominantBaseline="middle"
            style={{ fontSize: 9, fill: "#9ca3af" }}>{tick}</text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#trendGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={5}
            fill="white" stroke="#6366f1" strokeWidth={2.5} />
          <text x={p.x.toFixed(1)} y={(p.y - 12).toFixed(1)} textAnchor="middle"
            style={{ fontSize: 10, fontWeight: 700, fill: "#374151" }}>{p.score}</text>
          <text x={p.x.toFixed(1)} y={(H - 6).toFixed(1)} textAnchor="middle"
            style={{ fontSize: 9, fill: "#9ca3af" }}>
            {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        </g>
      ))}

      {/* Y axis label */}
      <text x={10} y={H / 2} textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90, 10, ${H / 2})`}
        style={{ fontSize: 9, fill: "#9ca3af" }}>TAERI Score</text>
    </svg>
  );
}

// ── Component Score Bar ────────────────────────────────────────────────────────

function ComponentBar({ label, score, maxScore = 7, description }: {
  label: string; score: number; maxScore?: number; description?: string;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const risk = scoreToRisk(score);
  const meta = RISK_META[risk];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${meta.pill}`}>{meta.label}</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums w-8 text-right">{score.toFixed(2)}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${meta.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Fall Risk Donut Chart (Recharts) ──────────────────────────────────────────

const DONUT_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

function FallRiskDonut({ green, yellow, red, total }: { green: number; yellow: number; red: number; total: number }) {
  const data = [
    { name: "Low Risk",  value: green  },
    { name: "Moderate",  value: yellow },
    { name: "High Risk", value: red    },
  ].filter((d) => d.value > 0);

  const allZero = total === 0;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={allZero ? [{ name: "No Data", value: 1 }] : data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={data.length > 1 ? 3 : 0}
            dataKey="value"
            strokeWidth={0}
          >
            {allZero ? (
              <Cell fill="#F3F4F6" />
            ) : (
              data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[["Low Risk","Moderate","High Risk"].indexOf(data[i].name)]} />
              ))
            )}
          </Pie>
          {!allZero && (
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${Math.round((value / total) * 100)}%)`,
                name,
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          )}
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12, color: "#6B7280" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label overlay */}
      <div className="flex justify-center -mt-[115px] mb-[75px] pointer-events-none">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">total</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-around mt-1">
        {[
          { label: "Low Risk",  value: green,  color: "#10B981" },
          { label: "Moderate",  value: yellow, color: "#F59E0B" },
          { label: "High Risk", value: red,    color: "#EF4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm font-bold text-gray-800 tabular-nums">{value}</span>
            <span className="text-[10px] text-gray-400">{label}</span>
            <span className="text-[10px] text-gray-400">{total > 0 ? Math.round((value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const [userRes, assessRes] = await Promise.all([
        adminAxios.get(`/admin/users/${id}`),
        adminAxios.get(`/admin/users/${id}/assessments`),
      ]);
      setUser(userRes.data.user);
      setAssessments(assessRes.data.assessments ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Computed ──────────────────────────────────────────────────────────────

  // Chart: last 6 assessments sorted oldest→newest
  const chartData = useMemo(() => {
    return [...assessments]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6)
      .map((a) => ({ date: a.date, score: a.finalScore }));
  }, [assessments]);

  // Latest assessment for component scores
  const latest = assessments[0] ?? null;

  // Component scores (normalize to 0-7 scale)
  const psychScore   = latest ? parseFloat((latest.psychological / 6 * 7).toFixed(2)) : null;
  const postureScore = latest ? parseFloat((latest.posture / 15 * 7).toFixed(2)) : null;
  const handlingScore = latest ? parseFloat((latest.handling / 3 * 7).toFixed(2)) : null;

  // Risk by task (latest assessment per unique task)
  const latestByTask = useMemo(() => {
    const map: Record<string, Assessment> = {};
    for (const a of assessments) {
      const key = a.taskName;
      if (!map[key] || new Date(a.date) > new Date(map[key].date)) {
        map[key] = a;
      }
    }
    return Object.values(map).sort((a, b) => b.finalScore - a.finalScore);
  }, [assessments]);

  // Risk distribution
  const riskCounts = useMemo(() => ({
    green:  assessments.filter((a) => a.riskLevel === "green").length,
    yellow: assessments.filter((a) => a.riskLevel === "yellow").length,
    red:    assessments.filter((a) => a.riskLevel === "red").length,
  }), [assessments]);

  // Avatar
  const ac = user ? avatarColor(user.name) : { bg: "bg-gray-100", text: "text-gray-400" };

  // Delete handler
  async function handleDelete() {
    setDeleting(true);
    try {
      await adminAxios.delete(`/admin/users/${id}`);
      router.replace("/users");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Sk className="h-6 w-48" />
        <Sk className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Sk className="h-56 rounded-2xl" />
            <Sk className="h-40 rounded-2xl" />
            <Sk className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Sk className="h-48 rounded-2xl" />
            <Sk className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500 font-semibold">Person not found</p>
        <Link href="/users" className="text-sm text-primary hover:underline">← Back to Persons</Link>
      </div>
    );
  }

  const overallMeta = user.overallRisk ? RISK_META[user.overallRisk] : null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/users" className="hover:text-primary transition-colors">Persons</Link>
        <span>›</span>
        <span className="text-gray-700 font-semibold">{user.name}</span>
      </div>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl ${ac.bg} ${ac.text} flex items-center justify-center text-xl font-bold shrink-0`}>
            {initials(user.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              {overallMeta && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overallMeta.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${overallMeta.dot}`} />
                  {overallMeta.label}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {user.age && <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.age} Years
              </span>}
              {user.livingSituation && <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {LIVING_LABELS[user.livingSituation] ?? user.livingSituation}
              </span>}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 text-center sm:border-l sm:border-gray-100 sm:pl-6 shrink-0">
            {[
              { label: "Registered", value: formatDate(user.createdAt) },
              { label: "Assessments", value: user.assessmentCount },
              { label: "TAERI Score", value: user.avgScore ?? "—", highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 min-w-[60px]">
                <p className={`text-base font-bold tabular-nums ${highlight ? "text-primary" : "text-gray-900"}`}>{value}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Score Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg TAERI Score", value: user.avgScore ?? "—", sub: user.overallRisk ? RISK_META[user.overallRisk].label : "—", color: "text-primary" },
              { label: "Lowest Score", value: user.lowestScore ?? "—", sub: user.lowestScore !== null ? RISK_META[scoreToRisk(user.lowestScore)].label : "—", color: "text-emerald-600" },
              { label: "Highest Score", value: user.highestScore ?? "—", sub: user.highestScore !== null ? RISK_META[scoreToRisk(user.highestScore)].label : "—", color: "text-red-500" },
              { label: "Last Assessment", value: user.lastAssessmentDate ? formatDate(user.lastAssessmentDate) : "—", sub: user.lastAssessmentDate ? timeAgo(user.lastAssessmentDate) : "Never", color: "text-gray-800", small: true },
            ].map(({ label, value, sub, color, small }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className={`${small ? "text-sm" : "text-2xl"} font-bold tabular-nums leading-tight ${color}`}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-1">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Risk Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Risk Trend (TAERI Score)</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last {Math.min(chartData.length, 6)} assessments</p>
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                TAERI Score Trend
              </span>
            </div>
            <RiskTrendChart data={chartData} />
          </div>

          {/* TAERI Component Scores */}
          {latest && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800">TAERI Component Scores</h3>
                <p className="text-xs text-gray-400 mt-0.5">From latest assessment · Score Range: 0 (Best) – 7 (Worst)</p>
              </div>
              <div className="space-y-5">
                {psychScore !== null && (
                  <ComponentBar label="Psychological Perception" score={psychScore} description="Physical demand + cognitive complexity" />
                )}
                {postureScore !== null && (
                  <ComponentBar label="Postural Risk" score={postureScore} description="Neck · Arm · Wrist · Back · Leg posture" />
                )}
                {handlingScore !== null && (
                  <ComponentBar label="Manual Handling Risk" score={handlingScore} description="Load handling and transfer demands" />
                )}
              </div>
            </div>
          )}

          {/* Recent Assessments */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800">All Assessments</h3>
                <p className="text-xs text-gray-400 mt-0.5">{assessments.length} total</p>
              </div>
            </div>
            {assessments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No assessments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Task</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">TAERI Score</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Risk Level</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Stability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {assessments.map((a) => {
                      const meta = RISK_META[a.riskLevel];
                      return (
                        <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(a.date)}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold text-gray-800">{a.taskName}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-primary tabular-nums">{a.finalScore}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400 hidden sm:table-cell">
                            {STABILITY_LABELS[a.stability] ?? a.stability}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Risk by Task */}
          {latestByTask.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Risk by Task</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest assessment score per unique task</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Task</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Risk Level</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Score (0–7)</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Last Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {latestByTask.map((a) => {
                      const meta = RISK_META[a.riskLevel];
                      return (
                        <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold text-gray-800">{a.taskName}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold tabular-nums text-gray-900">{a.finalScore}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400 hidden sm:table-cell">
                            {formatDate(a.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-5">

          {/* Fall Risk Chart */}
          {assessments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Fall Risk Distribution</h3>
              <FallRiskDonut
                green={riskCounts.green}
                yellow={riskCounts.yellow}
                red={riskCounts.red}
                total={assessments.length}
              />
            </div>
          )}

          {/* Person Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Person Information</h3>
            <div className="space-y-3">
              {[
                { label: "Age", value: user.age ? `${user.age} years` : "—", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { label: "Living Situation", value: user.livingSituation ? LIVING_LABELS[user.livingSituation] ?? user.livingSituation : "—", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { label: "Registered On", value: formatDate(user.createdAt), icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Total Assessments", value: user.assessmentCount.toString(), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/users"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                All Persons
              </Link>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Person
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 p-3 space-y-2">
                  <p className="text-xs text-red-500 font-semibold text-center">Delete {user.name} and all their data?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-2 rounded-lg bg-red-500 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                      {deleting ? "Deleting…" : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
