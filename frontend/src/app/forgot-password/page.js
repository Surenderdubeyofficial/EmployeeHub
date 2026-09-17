"use client";

import React, { useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900 inline-block"
          >
            Employee<span className="text-blue-600">Hub</span>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your work email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Reset Link Dispatched</p>
              <p className="mt-1 text-xs">
                If an account exists for <span className="font-bold">{email}</span>, you will receive an email with reset instructions shortly.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Work Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full text-sm py-3"
            >
              Send Password Reset Link
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
