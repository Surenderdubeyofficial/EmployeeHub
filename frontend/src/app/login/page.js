"use client";

import React from "react";
import Link from "next/link";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="mb-6 text-center">
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
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign In to EmployeeHub
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Access your organization dashboard, shift tracker, and tasks
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <LoginForm />

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Need an employee account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Register here →
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 px-2">
          <Link
            href="/"
            className="font-medium hover:text-slate-700 transition flex items-center gap-1"
          >
            <span>←</span> Back to Home
          </Link>

          <span className="text-slate-400">
            Enterprise Security
          </span>
        </div>
      </div>
    </main>
  );
}
