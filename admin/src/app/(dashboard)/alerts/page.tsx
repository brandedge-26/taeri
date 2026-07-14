"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { adminAxios } from "@/lib/axios";
import { useAlertReadStore } from "@/store/alertReadStore";

const PAGE_SIZE = 10;

interface AlertUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  livingSituation?: string;
}

interface Alert {
  _id: string;
  taskName: string;
  finalScore: number;
  riskLevel: "red";
  stability: string;
  weekNumber: number;
  date: string;
  createdAt: string;
  user: AlertUser | null;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function stabilityLabel(s: string) {
  if (s === "very_stable")       return "Very Stable";
  if (s === "somewhat_unsteady") return "Somewhat Unsteady";
  if (s === "very_unsteady")     return "Very Unsteady";
  return s;
}

function stabilityColor(s: string) {
  if (s === "very_stable")       return "text-green-600 bg-green-50";
  if (s === "somewhat_unsteady") return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function avatarColor(name: string) {
  const COLORS = [
    { bg: "bg-red-100",    text: "text-red-600" },
    { bg: "bg-orange-100", text: "text-orange-600" },
    { bg: "bg-rose-100",   text: "text-rose-600" },
    { bg: "bg-pink-100",   text: "text-pink-600" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function AlertsPage() {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");

  const { markRead, markAllRead, unmarkRead, isRead, unreadCount } = useAlertReadStore();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await adminAxios.get("/admin/alerts");
      setAlerts(data.alerts ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const allIds = useMemo(() => alerts.map((a) => a._id), [alerts]);
  const currentUnread = unreadCount(allIds);

  const filtered = useMemo(() => {
    let list = alerts;

    // read filter
    if (readFilter === "unread") list = list.filter((a) => !isRead(a._id));
    if (readFilter === "read")   list = list.filter((a) => isRead(a._id));

    // search
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (a) =>
          a.taskName.toLowerCase().includes(q) ||
          a.user?.name.toLowerCase().includes(q) ||
          a.user?.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [alerts, search, readFilter, isRead]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged       = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const uniquePatients = useMemo(
    () => new Set(alerts.map((a) => a.user?._id).filter(Boolean)).size,
    [alerts],
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  }, [totalPages, currentPage]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await adminAxios.delete(`/admin/assessments/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      unmarkRead(id);
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleReadFilter(v: "all" | "unread" | "read") { setReadFilter(v); setPage(1); }

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-10 max-w-sm" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── Summary strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Total Alerts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentUnread}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Unread</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{uniquePatients}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Patients Affected</p>
        </div>

      </div>

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by patient or task…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Read filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleReadFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                readFilter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "unread" ? `Unread (${currentUnread})` : f === "read" ? `Read (${alerts.length - currentUnread})` : "All"}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60"
        >
          <svg className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>

        {/* Mark all read */}
        {currentUnread > 0 && (
          <button
            onClick={() => markAllRead(allIds)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark all read
          </button>
        )}

        <span className="text-sm font-semibold text-gray-500 ml-auto">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold mr-1.5">
            {filtered.length}
          </span>
          alert{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Alert cards ────────────────────────────────────────────────────── */}
      {paged.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold">
            {search || readFilter !== "all" ? "No alerts match your filter" : "No high-risk alerts"}
          </p>
          <p className="text-gray-400 text-sm">
            {search || readFilter !== "all" ? "Try a different filter or search term" : "All patients are currently at low or moderate risk"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((alert) => {
            const colors = avatarColor(alert.user?.name ?? "U");
            const read   = isRead(alert._id);
            return (
              <div
                key={alert._id}
                className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Unread dot + avatar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${read ? "bg-transparent" : "bg-red-500"}`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colors.bg} ${colors.text}`}>
                      {(alert.user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <p className="font-bold text-gray-900 text-sm">{alert.user?.name ?? "Unknown Patient"}</p>
                      <span className="text-gray-300 hidden sm:inline">·</span>
                      <p className="text-xs text-gray-400">{alert.user?.email ?? "—"}</p>
                      {alert.user?.age && (
                        <>
                          <span className="text-gray-300 hidden sm:inline">·</span>
                          <p className="text-xs text-gray-400">Age {alert.user.age}</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">{alert.taskName}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                        </svg>
                        Score {alert.finalScore}
                      </span>

                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${stabilityColor(alert.stability)}`}>
                        {stabilityLabel(alert.stability)}
                      </span>

                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50">
                        Week {alert.weekNumber}
                      </span>

                      {alert.user?.livingSituation && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 capitalize">
                          {alert.user.livingSituation.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-700">{formatDate(alert.date)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTime(alert.createdAt)}</p>
                    </div>

                    {/* Read / Unread toggle */}
                    <button
                      onClick={() => read ? useAlertReadStore.getState().unmarkRead(alert._id) : markRead(alert._id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        read
                          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          : "text-green-600 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {read ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mark unread
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mark as read
                        </>
                      )}
                    </button>

                    {/* Delete */}
                    {confirmId === alert._id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 font-medium">Sure?</span>
                        <button
                          onClick={() => handleDelete(alert._id)}
                          disabled={deletingId === alert._id}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                          {deletingId === alert._id ? "…" : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(alert._id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >←</button>

            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 text-sm font-semibold rounded-xl border transition-all ${
                    p === currentPage
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >{p}</button>
              ),
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >→</button>
          </div>
        </div>
      )}

    </div>
  );
}
