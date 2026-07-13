import Image from "next/image";
import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* ── Left ── */}
            <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0">

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.12] tracking-tight mb-5">
                Predicting Risk.
                <br />
                Preventing Fall.
                <br />
                <span className="text-primary">Protecting Independence.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                TAERI guides elderly patients through daily task assessments
                to calculate fall risk scores — giving caregivers real-time
                insights to act early.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <a
                  href="#"
                  className="px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Download the App
                </a>
                <a
                  href="#how-it-works"
                  className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </a>
              </div>

              {/* Feature tiles — 2 cols on mobile, 4 on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* Task Assessment */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-200 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 leading-tight">Task Assessment</span>
                </div>

                {/* Risk Scoring */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-200 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 leading-tight">Risk Scoring</span>
                </div>

                {/* Patient Profiles */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-200 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 leading-tight">Patient Profiles</span>
                </div>

                {/* Safe & Private */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-200 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 leading-tight">Safe & Private</span>
                </div>

              </div>
            </div>

            {/* ── Right — hero image ── */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
                <Image
                  src="/hero.png"
                  alt="TAERI in use"
                  width={640}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* About */}
      <section id="about" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">

          {/* Section label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">About TAERI</p>

          {/* Headline + body — two-col on lg */}
          <div className="flex flex-col lg:flex-row lg:gap-20 gap-8">

            <div className="lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                Built for those who care for
                <span className="text-primary"> the ones who matter most.</span>
              </h2>
            </div>

            <div className="lg:w-1/2 flex flex-col gap-5 justify-center">
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                TAERI — Telehealth Ergonomic Assessment &amp; Risk Index — is a
                structured assessment platform designed to evaluate fall risk in
                elderly patients through guided daily task observations.
              </p>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                Caregivers and healthcare professionals use TAERI to track
                patient mobility over time, receive actionable risk scores, and
                intervene before a fall occurs — all from a simple mobile app.
              </p>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12 sm:my-16" />

          {/* 3-column stat blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">

            <div className="flex flex-col gap-2">
              <span className="text-4xl font-bold text-gray-900">4</span>
              <span className="text-sm font-semibold text-gray-700">Assessment Steps</span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Covers posture, balance, mobility, and task performance in a
                single structured session.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-4xl font-bold text-gray-900">10+</span>
              <span className="text-sm font-semibold text-gray-700">Risk Sub-scores</span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Each assessment breaks down into granular sub-scores giving
                clinicians a full picture of patient risk.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-4xl font-bold text-gray-900">Real-time</span>
              <span className="text-sm font-semibold text-gray-700">Caregiver Insights</span>
              <p className="text-sm text-gray-400 leading-relaxed">
                Results sync instantly to the caregiver dashboard so
                high-risk patients can be prioritized immediately.
              </p>
            </div>

          </div>

        </div>
      </section>
      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">

          {/* Header */}
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight">
              From assessment to insight
              <span className="text-primary"> in four steps.</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Step 01</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Patient Registers</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The patient or caregiver creates a profile with basic health and demographic details.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Step 02</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Completes Assessment</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  TAERI guides the patient through a structured 4-step task assessment covering posture, balance, and mobility.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Step 03</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Risk Score Calculated</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  TAERI instantly computes a weighted risk index across 10+ sub-scores and classifies the patient as Low, Moderate, or High risk.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Step 04</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Caregiver Reviews</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Results appear on the caregiver dashboard in real time so high-risk patients can be prioritized and interventions planned quickly.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom CTA strip */}
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-gray-200">
            <div>
              <p className="text-base font-bold text-gray-900 mb-1">Ready to get started?</p>
              <p className="text-sm text-gray-400">Download the TAERI app and complete your first assessment today.</p>
            </div>
            <a
              href="#"
              className="shrink-0 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Download the App
            </a>
          </div>

        </div>
      </section>
      {/* Features */}
      <section id="features" className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Features</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                Everything you need to
                <span className="text-primary"> manage fall risk.</span>
              </h2>
            </div>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm lg:text-right">
              TAERI brings clinical-grade tools into a simple mobile experience for patients and caregivers alike.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                ),
                title: "Guided Task Assessment",
                desc: "Patients are walked through each assessment step with clear instructions, removing the need for clinical supervision at every session.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                title: "Automated Risk Scoring",
                desc: "TAERI instantly calculates a weighted ergonomic risk index and classifies each patient as Low, Moderate, or High risk — no manual calculations.",
              },
              {
                icon: (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </>
                ),
                title: "10+ Risk Sub-scores",
                desc: "Every assessment breaks into granular sub-scores — posture, grip, gait, and more — giving clinicians a detailed picture beyond a single number.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ),
                title: "Trend Tracking Over Time",
                desc: "Track a patient's risk score across multiple assessments to identify deterioration early or confirm that interventions are working.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ),
                title: "Real-time Caregiver Dashboard",
                desc: "Results sync instantly to the caregiver's dashboard so high-risk patients surface immediately and care teams can act without delay.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: "Secure & Private by Design",
                desc: "Patient data is encrypted, never shared without consent, and stored in compliance with healthcare privacy standards.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                Trusted by caregivers
                <span className="text-primary"> across the country.</span>
              </h2>
            </div>
            {/* Star summary */}
            <div className="flex flex-col gap-1 sm:items-end shrink-0">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-900">4.9 out of 5</p>
              <p className="text-xs text-gray-400">Based on 120+ reviews</p>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              {
                name: "Dr. Sarah M.",
                role: "Geriatric Physiotherapist",
                initials: "SM",
                color: "bg-blue-100 text-blue-700",
                stars: 5,
                review:
                  "TAERI has completely changed how I monitor my elderly patients between clinic visits. The risk scores are accurate, easy to interpret, and flag high-risk cases before they become emergencies.",
              },
              {
                name: "James R.",
                role: "Home Care Nurse",
                initials: "JR",
                color: "bg-violet-100 text-violet-700",
                stars: 5,
                review:
                  "I use it daily during home visits. The step-by-step assessment guides me through everything consistently and my patients actually enjoy doing it — it feels less clinical than traditional tools.",
              },
              {
                name: "Aisha K.",
                role: "Occupational Therapist",
                initials: "AK",
                color: "bg-emerald-100 text-emerald-700",
                stars: 5,
                review:
                  "The sub-score breakdown is what sets TAERI apart. Instead of a single number I can not explain, I can show families exactly which tasks are causing risk and build a targeted care plan around that.",
              },
              {
                name: "Mark T.",
                role: "Caregiver — Family",
                initials: "MT",
                color: "bg-amber-100 text-amber-700",
                stars: 5,
                review:
                  "My mother has balance issues and I was always worried at home. TAERI gave us a clear picture of her risk level and helped us know exactly when to call her doctor. Peace of mind is everything.",
              },
              {
                name: "Dr. Priya S.",
                role: "Rehabilitation Specialist",
                initials: "PS",
                color: "bg-rose-100 text-rose-700",
                stars: 5,
                review:
                  "I recommended TAERI to our entire department. The caregiver dashboard is clean, the data syncs instantly, and the trend tracking over multiple assessments is invaluable for long-term patients.",
              },
              {
                name: "Carlos N.",
                role: "Senior Care Coordinator",
                initials: "CN",
                color: "bg-indigo-100 text-indigo-700",
                stars: 5,
                review:
                  "We run a 40-bed senior facility and TAERI reduced our fall incidents by helping staff spot declining patients earlier. It is the most practical digital tool we have adopted in years.",
              },
            ].map((r) => (
              <div key={r.name} className="flex flex-col gap-5 p-6 rounded-2xl border border-gray-200 bg-white">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(r.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{r.review}</p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.color}`}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">

            {/* Left */}
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-4">Get Started Today</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-white leading-[1.12] tracking-tight mb-5">
                Start protecting your patients
                <br className="hidden sm:block" /> before the next fall happens.
              </h2>
              <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-lg">
                Join caregivers and healthcare professionals using TAERI to assess, track, and act on fall risk — all from a simple mobile app.
              </p>
            </div>

            {/* Right — buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:w-56">
              <a
                href="#"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-primary text-sm font-bold hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download the App
              </a>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-blue-300 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                See How It Works
              </a>
            </div>

          </div>

          {/* Bottom divider + trust line */}
          <div className="border-t border-blue-400 mt-14 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-blue-200">No credit card required. Free to use for caregivers.</p>
            <div className="flex items-center gap-6">
              {["HIPAA Aware", "Encrypted Data", "No Ads Ever"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium text-blue-200">{badge}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} TAERI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
