"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OTPForm from "../../components/auth/OTPForm";

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-900 inline-block"
        >
          Employee<span className="text-blue-600">Hub</span>
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Account Verification
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Please verify your email address and mobile number to activate your account.
        </p>
      </div>

      <OTPForm initialEmail={email} initialPhone={phone} />
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="text-center text-sm text-slate-500">
            Loading verification...
          </div>
        }
      >
        <VerifyOTPContent />
      </Suspense>
    </main>
  );
}