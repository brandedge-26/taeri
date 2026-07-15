"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  AlertTriangle, Calendar, Camera, ClipboardList, DollarSign,
  FileText, GraduationCap, Handshake, Hospital, Home as HomeIcon, Lightbulb,
  Monitor, PenLine, RefreshCw, Shield, Smartphone, Stethoscope,
  Target, TrendingDown, TrendingUp, Users, WifiOff, Zap,
} from "lucide-react";
import Header from "./components/Header";

// ─── TAERI Scoring Engine ─────────────────────────────────────────────────────

const RISK_THRESHOLDS = { low: 1.6, high: 5.0 };

function mapPhysicalDemand(s: string) { return ({ None: 1, Minor: 1, Moderate: 2, "Too much": 3 } as any)[s] ?? 1; }
function mapComplexity(s: string) { return ({ "Not at all": 1, Slightly: 1, Moderately: 2, Extremely: 3 } as any)[s] ?? 1; }
function mapBack(s: string) { return ({ "Neutral, 0–20°": 1, "Flexed 20–60°": 2, "Flexed >60°": 3 } as any)[s] ?? 1; }
function mapShoulder(s: string) { return ({ "Close to body": 1, "Abducted 20–45°": 2, "Fully abducted >45°": 3 } as any)[s] ?? 1; }
function mapHandling(s: string) { return ({ "Light (<1 kg)": 1, "Moderate (1–5 kg)": 2, "Heavy (>5 kg)": 3 } as any)[s] ?? 1; }

const MULT_TABLE: Record<string, number[]> = {
  "<5 min": [0.006, 0.01, 0.02, 0.04],
  "16–25 min": [0.05, 0.1, 0.15, 0.34],
  ">1 hour": [0.18, 0.38, 0.54, 1.25],
};
const FREQ_IDX: Record<string, number> = { "Once/week": 0, "Twice/week": 1, "3×/week": 2, "Daily-ish": 3 };

function calcScore(inputs: {
  physicalDemand: string; complexity: string; back: string;
  shoulder: string; lifting: string; duration: string; frequency: string;
}) {
  const psych = mapPhysicalDemand(inputs.physicalDemand) + mapComplexity(inputs.complexity);
  const posture = mapBack(inputs.back) + mapShoulder(inputs.shoulder);
  const handling = mapHandling(inputs.lifting);
  const total = psych + posture + handling;
  const mult = MULT_TABLE[inputs.duration]?.[FREQ_IDX[inputs.frequency]] ?? 0.1;
  const exposure = Math.round(total * mult * 100) / 100;
  const level = exposure < RISK_THRESHOLDS.low ? "Low" : exposure <= RISK_THRESHOLDS.high ? "Moderate" : "High";
  const color = level === "Low" ? "#16a34a" : level === "Moderate" ? "#d97706" : "#dc2626";
  const implication = level === "Low"
    ? "Task is manageable — keep it up with a little caution."
    : level === "Moderate"
    ? "Not easy to perform — worth reconsidering how it's done."
    : "Hard to perform safely — this needs a closer look.";
  return { exposure, level, color, implication };
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 ${className}`}>
      <span className="inline-block w-5 h-px bg-primary" />
      {children}
    </p>
  );
}

function RiskDot({ level }: { level: "low" | "mod" | "high" }) {
  const cls = { low: "bg-green-500", mod: "bg-amber-500", high: "bg-red-500" }[level];
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />;
}

function RiskTag({ level }: { level: "low" | "mod" | "high" }) {
  const style = {
    low: "bg-green-50 text-green-700",
    mod: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  }[level];
  const label = { low: "Low", mod: "Moderate", high: "High" }[level];
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style}`}>{label}</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // Simulator state
  const [sim, setSim] = useState({
    physicalDemand: "Moderate", complexity: "Moderately",
    back: "Flexed 20–60°", shoulder: "Abducted 20–45°",
    lifting: "Moderate (1–5 kg)", duration: "16–25 min", frequency: "3×/week",
    fri: "2",
  });
  const simResult = calcScore(sim);
  const friText = { "1": "Very stable — low perceived fall risk.", "2": "Somewhat unsteady — moderate perceived fall risk.", "3": "Very unsteady — high perceived fall risk, flagged." }[sim.fri] ?? "";

  // Benefits tab
  const [activeTab, setActiveTab] = useState<"patients" | "clinicians" | "nhs">("patients");

  // App phone tab
  const [phoneView, setPhoneView] = useState(0);
  const phoneViews = [
    { label: "Select a task", img: "/taeri-app-images/assess_step-1.png" },
    { label: "Answer questions", img: "/taeri-app-images/assess_step.png" },
    { label: "Instant result", img: "/taeri-app-images/assess-result.png" },
    { label: "Weekly trends", img: "/taeri-app-images/analytics.png" },
  ];

  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: "How is TAERI different from a general wellness app?", a: "TAERI is built on the validated TAER methodology from peer-reviewed ergonomic research — not general wellness heuristics. It's designed specifically to surface injury and fall risk in home tasks before they cause harm, not to track steps or mood." },
    { q: "Do I need any training to use it?", a: "No. The original paper-based TAER tool required no prior training and remained accessible to people with low literacy — TAERI keeps that same simplicity, just delivered through a guided digital flow." },
    { q: "Does the Fall Risk Indicator affect my overall risk score?", a: "No — it's calculated and displayed separately from the ergonomic exposure score, so you get a complete picture of both physical strain and perceived stability without either one masking the other." },
    { q: "Does TAERI replace my GP, OT or physiotherapist?", a: "No. TAERI is designed to strengthen existing clinical pathways — GP services, community OT and physiotherapy, falls prevention programmes — by giving them information they wouldn't otherwise have between appointments." },
    { q: "What happens if a task scores High risk?", a: "You get a plain-language explanation of why, along with a practical suggestion for reducing the risk. If you're connected to a clinician, a persistently or repeatedly high-risk task also raises a flag on their dashboard." },
  ];

  const tabContent = {
    patients: {
      heading: "Confidence, not medicalisation",
      body: "TAERI stays focused on familiar chores — cleaning, laundry, shopping, personal care — and helps people see which tasks carry risk and how to perform them more safely, without turning daily life into a clinical exercise.",
      chips: ["Stay Independent Longer", "Peace of Mind for Families", "Early Warning Signs", "Personalised Support"],
      bullets: [
        "Immediate, personalised feedback and practical tips after every task",
        "Encourages adapting a task rather than avoiding it altogether",
        "Helps prevent falls and slow functional decline before they start",
        "Fewer emergency GP visits and hospital admissions",
        "Reassurance that wellbeing is being watched between appointments",
      ],
    },
    clinicians: {
      heading: "Visibility into the 167 hours you don't see",
      body: "A short consultation can't reconstruct how a patient really manages laundry, cooking or stairs day to day. TAERI replaces retrospective guesswork with longitudinal data on posture, effort, confidence, handling and balance.",
      chips: ["Visibility Between Visits", "Early Alerts", "Targeted Interventions"],
      bullets: [
        "Spot early decline before it becomes an incident report",
        "Prioritise patients who need intervention first",
        "Target advice at specific high-risk tasks, not generic guidance",
        "Dashboards and alerts speed up decisions and cut unnecessary visits",
        "Strengthens both remote and face-to-face assessments",
      ],
    },
    nhs: {
      heading: "Prevention that fits existing pathways",
      body: "TAERI aligns with NHS priorities in prevention, community-based care and digital health transformation — sitting naturally inside services that already exist, rather than asking for a new one.",
      chips: ["Reduced Hospital Admissions", "Cost-Effective Care", "Data-Driven Decisions", "Scalable Monitoring"],
      bullets: [
        "Fits GP services, community physiotherapy and OT, falls prevention programmes",
        "Shifts care upstream, from crisis response to early prevention",
        "Falls are among the costliest, most preventable causes of admission",
        "Better-targeted community resources and reduced pressure on acute services",
        "Supports a more sustainable, digitally-enabled NHS — without replacing existing services",
      ],
    },
  };

  return (
    <>
      <Header />

      {/* ── HERO ── */}
      <section id="top" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left */}
            <div className="flex-1 max-w-xl">
              <Eyebrow>Task Assessment for Ease &amp; Risk — Independence</Eyebrow>
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                Home safety shouldn't wait for an injury to prove the point.
              </h1>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6 max-w-lg">
                TAERI turns a validated piece of ergonomics research into a proactive telehealth platform — spotting rising risk in ordinary chores like laundry, cleaning and shopping, weeks before they lead to a fall or a hospital visit.
              </p>

              {/* Tagline pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["Predicting Risk", "Preventing Falls", "Protecting Independence"].map((p) => (
                  <span key={p} className="text-xs font-semibold bg-blue-50 text-primary px-4 py-2 rounded-full border border-blue-100">{p}</span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#simulator" className="px-6 py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
                  Try the live risk score →
                </a>
                <a href="#research" className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Read the research
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 flex-wrap">
                {[
                  { val: "78%", label: "Sensitivity in trial" },
                  { val: "76%", label: "Overall accuracy" },
                  { val: "3", label: "Validated parameters" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-3xl font-bold text-gray-900">{val}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — task log panel */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">This week's task log</p>
                  <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Live</span>
                </div>
                {[
                  { name: "Folding laundry", level: "low" as const },
                  { name: "Vacuuming stairs", level: "mod" as const },
                  { name: "Reaching top cupboard", level: "high" as const },
                  { name: "Weekly shop, light bags", level: "low" as const },
                  { name: "Cleaning the bath", level: "mod" as const },
                ].map((task) => (
                  <div key={task.name} className="flex items-center justify-between py-3 border-b border-dashed border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <RiskDot level={task.level} />
                      <span className="text-sm font-semibold text-gray-800">{task.name}</span>
                    </div>
                    <RiskTag level={task.level} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow className="justify-center">Why do we need TAERI?</Eyebrow>
          <h2 className="text-center text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            Healthcare reacts to falls. It rarely prevents them.
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
            Existing ergonomic tools were built for factories and warehouses — for tasks that are supervised, repetitive, and predictable. Home life is none of those things, which is exactly why the risk inside it goes unnoticed until something breaks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { tag: "Too Late", title: "Risk is recognised too late", body: "In most cases, functional risk is only identified after a fall or an injury has already happened — not before." },
              { tag: "Episodic", title: "Assessment is episodic", body: "Formal assessment usually happens only during scheduled clinical visits, leaving long gaps where nothing is being observed at all." },
              { tag: "Invisible", title: "Decline stays invisible", body: "Functional decline at home is gradual and largely unnoticed — by the person experiencing it and by the clinicians who could act on it." },
            ].map((c) => (
              <div key={c.tag} className="bg-white border border-gray-200 rounded-2xl p-7">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-3">{c.tag}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-xl sm:text-2xl font-bold text-gray-900 max-w-2xl mx-auto">
            Can we identify functional decline before a crisis occurs?
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            From a household chore to a clinical signal
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
            Every assessment follows the same validated flow as the original paper-based TAER guide — just faster, and shared with the people who can act on it.
          </p>

          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            {[
              { step: "01", title: "Select a task", detail: "e.g. cleaning, laundry, shopping — picked from a short list, no typing required." },
              { step: "02", title: "Answer five short questions", detail: "Psychological perception, body posture (neck, back, arms, legs), manual handling, frequency & duration, and the Fall Risk Indicator — how stable did you feel?" },
              { step: "03", title: "TAERI scores it instantly", detail: "Perception, posture and handling scores are combined and adjusted by a frequency-and-duration multiplier to produce one exposure score. The Fall Risk Indicator is recorded alongside it." },
              { step: "04", title: "Results, in plain language", detail: "A task risk level — Low, Moderate or High — plus a stability read-out, a short explanation, and a practical tip for reducing the risk next time." },
              { step: "05", title: "Trends build automatically", detail: "Weekly patterns, repeated high-risk tasks, and shifts in confidence or stability are tracked over time — no extra effort from the user." },
              { step: "06", title: "Clinicians see it too", detail: "When a patient is connected to a clinician, the same trends surface on a dashboard — with alerts for worsening or persistently high-risk tasks, supporting earlier intervention." },
            ].map((item, i) => (
              <div key={item.step} className={`flex flex-col sm:flex-row ${i < 5 ? "border-b border-gray-200" : ""}`}>
                <div className="sm:w-64 shrink-0 p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Step {item.step}</p>
                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                </div>
                <div className="flex-1 p-6 bg-blue-50/40">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP SECTION ── */}
      <section id="app" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>The TAERI app</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            The assessment, in your pocket
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
            Everything above happens inside a single, deliberately simple app — a few taps to log a task, one traffic-light result, and a trend line that quietly builds itself in the background.
          </p>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Phone mockup */}
            <div className="shrink-0 flex flex-col items-center gap-5">
              <div className="w-[240px]">
                <Image
                  src={phoneViews[phoneView].img}
                  alt={phoneViews[phoneView].label}
                  width={480}
                  height={960}
                  className="w-full h-auto"
                />
              </div>
              {/* Dots */}
              <div className="flex gap-2 items-center">
                {phoneViews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhoneView(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === phoneView ? "w-6 bg-primary" : "w-2 bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>

            {/* Features grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "Adaptive questionnaire", desc: "The flow adjusts as you answer — if you didn't lift anything, lifting questions are skipped automatically." },
                  { title: "Instant traffic-light scoring", desc: "Every task returns a Green, Yellow or Red result the moment it's logged, with a plain-language reason why." },
                  { title: "Trends, not just snapshots", desc: "Weekly patterns and repeated high-risk tasks surface automatically, so decline is caught early rather than in hindsight." },
                  { title: "Clinician connection", desc: "When linked to a healthcare professional, the same data reaches their dashboard — with alerts on worsening tasks." },
                  { title: "In-app video capture", desc: "Optionally record a task for a clinician to review, stored securely rather than described from memory." },
                  { title: "Exportable reports", desc: "A patient summary can be viewed in-app or exported as a PDF to bring to — or send ahead of — an appointment." },
                ].map((f) => (
                  <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Smartphone className="w-3.5 h-3.5" />, label: "iOS & Android (React Native)" },
                  { icon: <Monitor className="w-3.5 h-3.5" />, label: "Progressive Web App" },
                  { icon: <Stethoscope className="w-3.5 h-3.5" />, label: "Web clinician dashboard" },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-primary px-4 py-2 rounded-full border border-blue-100">
                    {icon}{label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIMULATOR ── */}
      <section id="simulator" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>Try it yourself</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            The actual scoring logic, live
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
            This is a working model of TAERI's exposure-score algorithm — the same three parameters and thresholds validated in the original research. Change the answers and watch the traffic light respond.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Controls */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {([
                { label: "Physical demand felt", key: "physicalDemand", opts: ["None", "Minor", "Moderate", "Too much"] },
                { label: "Task complexity felt", key: "complexity", opts: ["Not at all", "Slightly", "Moderately", "Extremely"] },
                { label: "Back posture", key: "back", opts: ["Neutral, 0–20°", "Flexed 20–60°", "Flexed >60°"] },
                { label: "Shoulder posture", key: "shoulder", opts: ["Close to body", "Abducted 20–45°", "Fully abducted >45°"] },
                { label: "Heaviest item lifted", key: "lifting", opts: ["Light (<1 kg)", "Moderate (1–5 kg)", "Heavy (>5 kg)"] },
                { label: "Duration", key: "duration", opts: ["<5 min", "16–25 min", ">1 hour"] },
                { label: "Frequency", key: "frequency", opts: ["Once/week", "Twice/week", "3×/week", "Daily-ish"] },
              ] as { label: string; key: keyof typeof sim; opts: string[] }[]).map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1.5">{label}</label>
                  <select
                    value={sim[key]}
                    onChange={(e) => setSim((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1.5">Felt stability during the task (Fall Risk Indicator)</label>
                <select
                  value={sim.fri}
                  onChange={(e) => setSim((s) => ({ ...s, fri: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="1">Very stable</option>
                  <option value="2">Somewhat unsteady</option>
                  <option value="3">Very unsteady</option>
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="flex flex-col items-center justify-center text-center border-t border-dashed border-gray-200 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mb-5 transition-all duration-300"
                style={{ background: simResult.color }}
              >
                <span className="text-3xl font-bold text-white">{simResult.exposure}</span>
              </div>
              <p className="text-lg font-bold mb-2" style={{ color: simResult.color }}>{simResult.level} risk</p>
              <p className="text-sm text-gray-500 max-w-[220px] mb-5">{simResult.implication}</p>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 text-left w-full">
                <span className="font-bold text-gray-700">Fall Risk Indicator: </span>{friText}
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-sm text-gray-400">
            Risk bands: <b className="text-green-600">Low &lt; 1.6</b> · <b className="text-amber-600">Moderate 1.6–5</b> · <b className="text-red-600">High &gt; 5</b>. No prior training required.
          </p>
        </div>
      </section>

      {/* ── RESEARCH ── */}
      <section id="research" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>The research</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            Ten years, one continuous thread
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-14">
            TAERI isn't a wellness app dressed up in clinical language. It's the direct digital descendant of PhD research undertaken at the University of Sheffield, published in the <em>International Journal of Public Health and Clinical Sciences.</em>
          </p>

          {/* Timeline */}
          <div className="relative max-w-3xl">
            <div className="absolute left-24 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />
            {[
              { year: "2015–2018", title: "The gap in the room", body: "Working alongside occupational therapists and watching people perform ordinary domestic tasks made one thing obvious: assessment tools built for factories don't fit homes. That observation became TAER — a paper-based methodology assessing Psychological Perception, Adopted Postures, and Manual Handling." },
              { year: "2018–2020", title: "Where paper falls short", body: "The methodology worked, but the format didn't scale: manual scoring was slow and error-prone, nothing was tracked over time, remote monitoring wasn't possible, and clinicians had no way to flag risk before an appointment." },
              { year: "2022–2024", title: "TAERI: Independence, Interface", body: "TAER became TAERI — retaining every validated parameter while adding instant scoring, personalised feedback, and trend tracking through a mobile interface designed for people who've never needed a health app before." },
              { year: "2025–present", title: "A connected telehealth ecosystem", body: "Continuous monitoring, tailored recommendations, and secure clinical connectivity now sit alongside the original methodology — reducing reliance on in-person visits without reducing the quality of care." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 mb-8 last:mb-0 relative">
                <div className="hidden sm:block w-24 shrink-0 text-right">
                  <p className="text-xs font-bold text-primary pt-1">{item.year}</p>
                </div>
                <div className="hidden sm:block absolute left-[93px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-gray-50" />
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-xs font-bold text-primary mb-2 sm:hidden">{item.year}</p>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Validation strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 bg-white border border-gray-200 rounded-2xl p-6 gap-y-6">
            {[
              { val: "20", label: "Trial participants" },
              { val: "78%", label: "Sensitivity" },
              { val: "74%", label: "Specificity" },
              { val: "76%", label: "Accuracy identifying discomfort" },
            ].map(({ val, label }, i) => (
              <div key={label} className={`text-center ${i % 2 === 0 ? "border-r border-dashed border-gray-200 sm:border-r-0" : ""} ${i < 3 ? "sm:border-r sm:border-dashed sm:border-gray-200" : ""}`}>
                <p className="text-3xl font-bold text-gray-900 mb-1">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* TAER → TAERI compare */}
          <div className="mt-14">
            <Eyebrow className="justify-center">The science remained. The delivery changed.</Eyebrow>
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8">From TAER to TAERI</h2>
            <div className="flex flex-col sm:flex-row border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex-1 p-7 bg-gray-50">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">TAER — 2015–2018</p>
                {[
                  { icon: <FileText className="w-4 h-4 shrink-0" />, label: "Paper-based" },
                  { icon: <PenLine className="w-4 h-4 shrink-0" />, label: "Manual scoring" },
                  { icon: <Calendar className="w-4 h-4 shrink-0" />, label: "One-time assessment" },
                  { icon: <WifiOff className="w-4 h-4 shrink-0" />, label: "No remote monitoring" },
                  { icon: <TrendingDown className="w-4 h-4 shrink-0" />, label: "No trends" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-gray-200 last:border-0 text-sm text-gray-500">
                    <span className="text-gray-400">{icon}</span>{label}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center bg-white px-4 py-6 sm:py-0">
                <span className="text-2xl text-amber-500">→</span>
              </div>
              <div className="flex-1 p-7 bg-blue-50">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">TAERI — today</p>
                {[
                  { icon: <Smartphone className="w-4 h-4 shrink-0" />, label: "Digital platform" },
                  { icon: <Zap className="w-4 h-4 shrink-0" />, label: "Automatic scoring" },
                  { icon: <RefreshCw className="w-4 h-4 shrink-0" />, label: "Continuous monitoring" },
                  { icon: <TrendingUp className="w-4 h-4 shrink-0" />, label: "Trend analysis" },
                  { icon: <Stethoscope className="w-4 h-4 shrink-0" />, label: "Clinician dashboard & remote care" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-blue-100 last:border-0 text-sm font-semibold text-gray-800">
                    <span className="text-primary">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Science pathway */}
          <div className="mt-14">
            <Eyebrow className="justify-center">Built on science</Eyebrow>
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Five disciplines, one validated pathway</h2>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
              {["Human Factors", "Ergonomics", "TAER Validation", "Digital Health"].map((node) => (
                <React.Fragment key={node}>
                  <div className="flex-1 min-w-[120px] bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-gray-900 mb-1">{node}</p>
                    <p className="text-xs text-gray-400">Research phase</p>
                  </div>
                  <span className="text-xl text-amber-500 rotate-90 sm:rotate-0 inline-block">→</span>
                </React.Fragment>
              ))}
              <div className="flex-1 min-w-[120px] bg-primary rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-white mb-1">TAERI</p>
                <p className="text-xs text-blue-200">Validated intervention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FRI SECTION ── */}
      <section id="fri" className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left */}
            <div className="flex-1 max-w-xl">
              <Eyebrow className="text-amber-400">Beyond ergonomics</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-[1.15] mb-5">The Fall Risk Indicator</h2>
              <p className="text-base text-gray-400 leading-relaxed mb-4">
                The core TAERI assessment covers effort, posture and handling — but none of that captures balance, one of the strongest predictors of a fall at home. The Fall Risk Indicator closes that gap with a single, deliberately simple question:
              </p>
              <p className="text-lg font-semibold text-white italic mb-4">
                "How stable did you feel <span className="text-amber-400 not-italic">during this task</span>?"
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                It's scored separately from the ergonomic exposure total and shown alongside it — so a task can look ergonomically fine while still raising a stability flag that's worth acting on.
              </p>
            </div>

            {/* Right — FRI scale */}
            <div className="flex-1 w-full max-w-md flex flex-col gap-4">
              {[
                { num: "1", label: "Very stable", sub: "Low perceived fall risk", color: "text-green-400" },
                { num: "2", label: "Somewhat unsteady", sub: "Moderate perceived fall risk — worth a note", color: "text-amber-400" },
                { num: "3", label: "Very unsteady", sub: "High perceived fall risk — triggers a safety flag", color: "text-red-400" },
              ].map((r) => (
                <div key={r.num} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
                  <span className={`text-2xl font-bold shrink-0 ${r.color}`}>{r.num}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{r.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY DIFFERENT ── */}
      <section id="different" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>Why TAERI is different</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-8">
            Not a smarter clinic visit. A different kind of care.
          </h2>
          <div className="flex flex-col sm:flex-row border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex-1 p-7 bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Traditional assessment</p>
              {[
                { icon: <Hospital className="w-4 h-4 shrink-0" />, label: "Clinic-based" },
                { icon: <AlertTriangle className="w-4 h-4 shrink-0" />, label: "Reactive" },
                { icon: <Calendar className="w-4 h-4 shrink-0" />, label: "Periodic" },
                { icon: <ClipboardList className="w-4 h-4 shrink-0" />, label: "General assessment" },
                { icon: <PenLine className="w-4 h-4 shrink-0" />, label: "Manual" },
                { icon: <Camera className="w-4 h-4 shrink-0" />, label: "Snapshot" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-gray-200 last:border-0 text-sm text-gray-500">
                  <span className="text-gray-400">{icon}</span>{label}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center bg-white px-4 py-6 sm:py-0">
              <span className="text-2xl text-amber-500">→</span>
            </div>
            <div className="flex-1 p-7 bg-blue-50">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">TAERI</p>
              {[
                { icon: <HomeIcon className="w-4 h-4 shrink-0" />, label: "Home-based" },
                { icon: <Shield className="w-4 h-4 shrink-0" />, label: "Preventive" },
                { icon: <RefreshCw className="w-4 h-4 shrink-0" />, label: "Continuous" },
                { icon: <Target className="w-4 h-4 shrink-0" />, label: "Task-specific" },
                { icon: <Zap className="w-4 h-4 shrink-0" />, label: "Digital" },
                { icon: <TrendingUp className="w-4 h-4 shrink-0" />, label: "Longitudinal trends" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-blue-100 last:border-0 text-sm font-semibold text-gray-800">
                  <span className="text-primary">{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT SERVES ── */}
      <section id="benefits" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>Who it serves</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            One assessment, three audiences
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-10">
            TAERI doesn't replace clinical care — it fills the gap between appointments, for everyone involved in it.
          </p>

          {/* Tabs */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {([
              { key: "patients", label: "Patients & families" },
              { key: "clinicians", label: "Clinicians" },
              { key: "nhs", label: "Health systems" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${activeTab === key ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {(() => {
            const t = tabContent[activeTab];
            return (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t.heading}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">{t.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.chips.map((c) => (
                      <span key={c} className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-primary px-3 py-1.5 rounded-full border border-blue-100">
                        <span className="text-green-500 font-black">✓</span>{c}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="space-y-3">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── FOR CLINICIANS (dashboard) ── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 max-w-xl">
              <Eyebrow>For Clinicians & Caregivers</Eyebrow>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-5">
                Everything your care team needs —
                <span className="text-primary"> in one place.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8">
                The TAERI clinician dashboard gives doctors and caregivers a real-time view of every patient's fall risk. Monitor assessments, track risk trends, and act before an incident occurs — all without leaving your desk.
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Live patient risk scores", desc: "See every patient's latest assessment result and overall risk classification at a glance." },
                  { title: "High-risk alerts", desc: "Get instantly notified when a patient's score crosses the high-risk threshold so no case is missed." },
                  { title: "Assessment history & trends", desc: "Review a patient's full assessment timeline to identify declining mobility or improving outcomes." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                <Image src="/doctor-dashboard.png" alt="TAERI clinician dashboard" width={1200} height={800} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY INNOVATIONS ── */}
      <section id="innovations" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
          <Eyebrow className="justify-center">Key innovations</Eyebrow>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8">What sets the platform apart</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Fall Risk Indicator", "Functional Dependency Risk", "Real-Time Dashboard", "Personalised Feedback", "Secure & GDPR-Ready"].map((chip) => (
              <span key={chip} className="flex items-center gap-2 text-sm font-semibold bg-white border border-gray-200 rounded-full px-5 py-3 text-gray-800">
                <span className="text-green-500 font-black">✓</span>{chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow>Development roadmap</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
            From research partnership to healthcare implementation
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
            TAERI is progressing deliberately through clinical validation — not skipping straight from idea to app store.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { num: "1", title: "Research", tag: "Complete", status: "done" },
              { num: "2", title: "Prototype", tag: "Complete", status: "done" },
              { num: "3", title: "Co-design", tag: "Next", status: "now" },
              { num: "4", title: "Pilot Study", tag: "Next", status: "now" },
              { num: "5", title: "Clinical Validation", tag: "Future", status: "future" },
              { num: "6", title: "Healthcare Implementation", tag: "Future", status: "future" },
            ].map((step) => {
              const numCls = step.status === "done" ? "bg-green-500 text-white" : step.status === "now" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500";
              return (
                <div key={step.num} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-3 ${numCls}`}>{step.num}</div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{step.tag}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 justify-center mt-6 flex-wrap">
            {[
              { color: "bg-green-500", label: "Complete" },
              { color: "bg-amber-500", label: "Next" },
              { color: "bg-gray-200", label: "Future" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOW ── */}
      <section id="why-now" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
          <Eyebrow className="justify-center">Why TAERI matters now</Eyebrow>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-4">A shift already underway</h2>
          <p className="text-center text-base text-gray-500 max-w-xl mx-auto mb-10">
            TAERI supports the global shift from reactive healthcare to proactive, person-centred care.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5 text-primary" />, label: "Population Ageing" },
              { icon: <Stethoscope className="w-5 h-5 text-primary" />, label: "Healthcare Workforce Pressure" },
              { icon: <Monitor className="w-5 h-5 text-primary" />, label: "Digital Transformation" },
              { icon: <Shield className="w-5 h-5 text-primary" />, label: "Preventive Healthcare" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl py-5 px-4 flex flex-col items-center gap-2 text-center">
                {icon}
                <span className="text-sm font-bold text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow className="justify-center">Let's build the future together</Eyebrow>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-4">We're looking for research and delivery partners</h2>
          <p className="text-center text-base text-gray-500 max-w-xl mx-auto mb-12">
            TAERI is at the co-design and pilot stage — the right partners now shape what clinical validation and rollout look like next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { icon: <Hospital className="w-7 h-7 text-primary" />, title: "Health Systems" },
              { icon: <GraduationCap className="w-7 h-7 text-primary" />, title: "Universities" },
              { icon: <Stethoscope className="w-7 h-7 text-primary" />, title: "Occupational Therapists" },
              { icon: <Lightbulb className="w-7 h-7 text-primary" />, title: "Innovation Programmes" },
              { icon: <DollarSign className="w-7 h-7 text-primary" />, title: "Research Funding" },
              { icon: <Handshake className="w-7 h-7 text-primary" />, title: "Industry Partners" },
            ].map(({ icon, title }) => (
              <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3">
                {icon}
                <p className="text-sm font-bold text-gray-900">{title}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
              Get in touch about partnering
            </a>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section id="mission" className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Eyebrow className="text-amber-400 justify-center">Vision</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Independence, protected before it's lost</h2>
            <p className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-6">
              Imagine a future where everyday activities become{" "}
              <span className="text-amber-400">opportunities to detect risk</span>{" "}
              — not missed warning signs.
            </p>
            <p className="text-base text-gray-400 leading-relaxed mb-8">
              To empower people to maintain independence, safety and quality of life by proactively identifying ergonomic and balance-related risk in the home — before it results in injury or functional decline. The vision is a holistic, connected telehealth ecosystem that combines validated ergonomic assessment, fall risk awareness and personalised intervention within routine care.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Predicting Risk", "Preventing Falls", "Protecting Independence"].map((p) => (
                <span key={p} className="text-xs font-semibold bg-white/10 text-white px-4 py-2 rounded-full">{p}</span>
              ))}
            </div>
            <p className="text-2xl font-bold text-amber-400 tracking-wide">TAERI</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <Eyebrow className="justify-center">Questions</Eyebrow>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-12">Frequently asked</h2>
          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <span className={`text-xl text-primary shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-48 pb-5" : "max-h-0"}`}>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="bg-amber-50 border-t border-amber-200 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to see where the risk really is?</h3>
              <p className="text-sm text-gray-500">Try the live scoring model above, or get in touch about piloting TAERI with your service.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="#simulator" className="px-6 py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">Try the score</a>
              <a href="#contact" className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors">Get in touch</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP SCREENSHOTS ── */}
      <section className="bg-white border-t border-gray-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
          <Eyebrow>App Preview</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">See TAERI in action.</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 sm:-mx-10 sm:px-10">
            {[
              { src: "/taeri-app-images/onboarding-1.png", label: "Welcome" },
              { src: "/taeri-app-images/onboarding-2.png", label: "Onboarding" },
              { src: "/taeri-app-images/home.png", label: "Home" },
              { src: "/taeri-app-images/assess_step.png", label: "Assessment" },
              { src: "/taeri-app-images/assess-result.png", label: "Risk Result" },
              { src: "/taeri-app-images/assess_history.png", label: "History" },
              { src: "/taeri-app-images/analytics.png", label: "Analytics" },
              { src: "/taeri-app-images/profile.png", label: "Profile" },
            ].map(({ src, label }) => (
              <div key={src} className="flex flex-col items-center gap-3 shrink-0 snap-start">
                <div className="w-[160px] sm:w-[180px] rounded-[28px] overflow-hidden border border-gray-200 shadow-lg">
                  <Image src={src} alt={label} width={400} height={800} className="w-full h-auto" />
                </div>
                <span className="text-xs font-semibold text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Image src="/real-logo.png" alt="TAERI" width={120} height={34} className="h-8 w-auto object-contain brightness-0 invert" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[260px]">
                Task Assessment for Ease & Risk — Independence. Proactive telehealth, grounded in validated ergonomic research from the University of Sheffield.
              </p>
            </div>
            {/* Platform */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Platform</p>
              <ul className="space-y-2.5">
                {[
                  { label: "How it works", href: "#how-it-works" },
                  { label: "Live risk score", href: "#simulator" },
                  { label: "Fall Risk Indicator", href: "#fri" },
                  { label: "The App", href: "#app" },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            {/* Evidence */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Evidence</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Research timeline", href: "#research" },
                  { label: "Why TAERI is different", href: "#different" },
                  { label: "Who it's for", href: "#benefits" },
                  { label: "Development roadmap", href: "#roadmap" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contact</p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>Dr Asim Zaheer, Project Lead</li>
                <li><a href="mailto:asimzaheer@neduet.edu.pk" className="hover:text-white transition-colors">asimzaheer@neduet.edu.pk</a></li>
                <li><a href="tel:+923212700850" className="hover:text-white transition-colors">+92 321 2700850</a></li>
                <li><a href="#partners" className="hover:text-white transition-colors">Partner with us</a></li>
              </ul>
            </div>
          </div>
          <p className="text-center italic text-sm text-gray-500 max-w-2xl mx-auto my-8">
            "Together, we can transform how functional decline is detected and managed — keeping people safer, healthier, and more independent for longer."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>© 2026 TAERI. Built on validated research, not guesswork.</span>
            <span>International Journal of Public Health and Clinical Sciences</span>
          </div>
        </div>
      </footer>
    </>
  );
}
