"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-900 inline-block"
        >
          Employee<span className="text-blue-600">Hub</span>
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Set New Password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a secure new password for your account.
        </p>
      </div>

      {success ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-bold text-base">Password Updated!</p>
            <p className="mt-1 text-xs">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <PasswordInput
            label="New Password"
            name="password"
            value={password}
            placeholder="At least 8 characters"
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            value={confirmPassword}
            placeholder="Repeat new password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full text-sm py-3"
          >
            Update Password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="text-center text-sm text-slate-500">
            Loading reset form...
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
