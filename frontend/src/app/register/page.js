"use client";

import React from "react";
import Link from "next/link";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-base shadow-xs transition group-hover:bg-blue-500">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Employee<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Employee Registration
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Create your profile to join your organization on EmployeeHub. Use Google SSO or complete the form below.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an active account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Sign in to EmployeeHub →
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
