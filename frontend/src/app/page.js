import Link from "next/link";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    title: "Employee Directory & Profiles",
    description:
      "Maintain centralized records with full profiles, skill tags, employment contracts, and document uploads.",
    badge: "Workforce",
    icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: "Task Management & Deliverables",
    description:
      "Assign, monitor, and transition team deliverables with granular urgency priorities, due dates, and live status tracking.",
    badge: "Productivity",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Attendance & Shifts",
    description:
      "Enable 1-click arrival check-in and departure check-out, with daily attendance logs and automated shift summaries.",
    badge: "Operations",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Google Identity & 1-Click SSO",
    description:
      "Seamless authentication via Google Identity Services GIS with One Tap popup, token verification, and instant onboarding.",
    badge: "Security",
    icon: (
      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.18-8.736A9.006 9.006 0 0012 3a9.006 9.006 0 00-6.07 2.014c-.397.35-.615.867-.587 1.396.14 2.656 1.134 7.02 6.657 9.59 5.523-2.57 6.517-6.934 6.657-9.59.028-.53-.19-1.046-.587-1.396z" />
      </svg>
    ),
  },
  {
    title: "Twilio 2FA Mobile OTP",
    description:
      "High-deliverability SMS verification codes via Twilio Verify API with E.164 normalization and anti-abuse cooldowns.",
    badge: "Verification",
    icon: (
      <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    title: "Executive Analytics & Metrics",
    description:
      "Department distribution breakdown, workforce attendance percentage, and live task completion progress meters.",
    badge: "Insights",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-6">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>EMPLOYEE MANAGEMENT & OPERATIONS PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 leading-[1.15]">
              Manage Your Workforce.{" "}
              <span className="text-blue-600">
                Simplify Every Workday.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
              EmployeeHub unifies personnel records, agile deliverables, daily shift tracking, and role-based access control into one dependable workspace.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-xs"
              >
                Get Started Free →
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign In to Portal
              </Link>
            </div>

            {/* Security Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-blue-600">✓</span> Google SSO Enabled
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Twilio SMS OTP Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-600">✓</span> Role-Based Access Control
              </span>
            </div>
          </div>

          {/* Interactive Mock Dashboard Showcase Preview */}
          <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto rounded-lg bg-white px-6 py-1 text-[11px] font-semibold text-slate-400 border border-slate-200 shadow-2xs">
                  employeehub.internal/dashboard
                </div>
              </div>

              {/* Showcase Content */}
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Total Workforce</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">48 Active</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">● 96% Present today</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Daily Check-Ins</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">46 Checked In</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Avg 09:12 AM arrival</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Deliverables</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">14 In Progress</p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">3 Completed today</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Security Health</p>
                    <p className="text-2xl font-black text-purple-600 mt-1">100% 2FA</p>
                    <p className="text-[11px] text-purple-600 font-semibold mt-1">Zero vulnerabilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="border-t border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Core Capabilities
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Engineered for Modern Enterprise Operations
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Every tool your management, HR team, and employees need to perform at their best.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="group relative rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition group-hover:scale-110">
                      {feat.icon}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-600">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats & Infrastructure Section */}
        <section id="stats" className="border-t border-slate-200 bg-slate-900 text-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              <div>
                <p className="text-4xl font-black text-blue-400">99.9%</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Uptime SLA</p>
              </div>
              <div>
                <p className="text-4xl font-black text-emerald-400">1-Click</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Google SSO</p>
              </div>
              <div>
                <p className="text-4xl font-black text-purple-400">256-Bit</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Encrypted Data</p>
              </div>
              <div>
                <p className="text-4xl font-black text-amber-400">&lt;50ms</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">API Response</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Ready to Upgrade Your Organization?
            </h2>
            <p className="mt-4 text-base text-blue-100 max-w-2xl mx-auto">
              Join EmployeeHub today and experience a modern, secure, and intuitive workforce management environment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-600 shadow-md transition hover:bg-blue-50"
              >
                Create Account Now
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border border-white/40 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 font-black text-white text-xs">
              E
            </div>
            <span className="font-bold text-slate-800">EmployeeHub</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-blue-600 transition">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-blue-600 transition">
              Employee Portal
            </Link>
            <Link href="/register" className="hover:text-blue-600 transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
