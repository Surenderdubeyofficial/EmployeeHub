"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import Button from "../ui/Button";

export default function OTPForm({ initialEmail = "", initialPhone = "" }) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);

  const [emailResendCooldown, setEmailResendCooldown] = useState(60);
  const [mobileResendCooldown, setMobileResendCooldown] = useState(60);

  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Edit/Change mobile number state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editCountryCode, setEditCountryCode] = useState("IN");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [phoneUpdateError, setPhoneUpdateError] = useState("");
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState("");

  // Recover email/phone from localStorage if arrived without query params
  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) setEmail(parsed.email);
          if (parsed?.phone && !phone) setPhone(parsed.phone);
        }
      } catch {}
    }
  }, [email, phone]);

  // Cooldown timers
  useEffect(() => {
    let timer;
    if (emailResendCooldown > 0) {
      timer = setInterval(() => {
        setEmailResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailResendCooldown]);

  useEffect(() => {
    let timer;
    if (mobileResendCooldown > 0) {
      timer = setInterval(() => {
        setMobileResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mobileResendCooldown]);

  // If both verified, proceed to dashboard or login
  useEffect(() => {
    if (emailVerified && mobileVerified) {
      setSuccessMessage("Account fully verified! Redirecting to your dashboard...");
      const timeout = setTimeout(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          window.location.href = "/dashboard";
        } else {
          router.push("/login?verified=true");
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [emailVerified, mobileVerified, router]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!emailOtp || emailOtp.length < 4) {
      setEmailError("Please enter a valid OTP code");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post("/api/auth/verify-email-otp", {
        email: email.trim(),
        otp: emailOtp.trim(),
      });
      setEmailVerified(true);
      if (res?.token && res?.user && typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
    } catch (err) {
      setEmailError(err.message || "Invalid or expired Email OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    setMobileError("");

    if (!mobileOtp || mobileOtp.length < 4) {
      setMobileError("Please enter a valid OTP code");
      return;
    }

    setMobileLoading(true);
    try {
      const res = await api.post("/api/auth/verify-mobile-otp", {
        email: email ? email.trim() : undefined,
        phone: phone.trim(),
        otp: mobileOtp.trim(),
      });
      setMobileVerified(true);
      if (res?.token && res?.user && typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
    } catch (err) {
      setMobileError(err.message || "Invalid or expired Mobile OTP");
    } finally {
      setMobileLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (emailResendCooldown > 0) return;
    try {
      await api.post("/api/auth/resend-email-otp", { email: email.trim() });
      setEmailResendCooldown(60);
      alert("New email OTP has been sent!");
    } catch (err) {
      setEmailError(err.message || "Failed to resend email OTP");
    }
  };

  const handleResendMobile = async () => {
    if (mobileResendCooldown > 0) return;
    try {
      await api.post("/api/auth/resend-mobile-otp", {
        email: email ? email.trim() : undefined,
        phone: phone.trim(),
      });
      setMobileResendCooldown(60);
      alert("New mobile OTP has been sent!");
    } catch (err) {
      setMobileError(err.message || "Failed to resend mobile OTP");
    }
  };

  const handleUpdatePhone = async (e) => {
    if (e) e.preventDefault();
    setPhoneUpdateError("");
    setPhoneUpdateSuccess("");

    const cleanNumber = editPhoneNumber.trim().replace(/^0+/, "");
    if (!cleanNumber || cleanNumber.length < 6) {
      setPhoneUpdateError("Please enter a valid mobile number");
      return;
    }

    if (editPhoneNumber.trim().startsWith("0")) {
      setPhoneUpdateError("Mobile number cannot start with 0 as country code is already selected");
      return;
    }

    if (!email) {
      setPhoneUpdateError("Email address is missing. Please return to login and try again.");
      return;
    }

    setPhoneUpdateLoading(true);
    try {
      const res = await api.post("/api/auth/change-verification-phone", {
        email: email.trim(),
        newPhone: cleanNumber,
        countryCode: editCountryCode,
      });

      const updatedNumber = res?.data?.phone || res?.phone || cleanNumber;
      setPhone(updatedNumber);
      setMobileOtp("");
      setMobileError("");
      setMobileResendCooldown(60);
      setIsEditingPhone(false);
      setPhoneUpdateSuccess(`Mobile number updated to ${updatedNumber}. A fresh OTP code has been dispatched.`);
    } catch (err) {
      setPhoneUpdateError(err.message || "Failed to update mobile number");
    } finally {
      setPhoneUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-800">
          🎉 {successMessage}
        </div>
      )}

      {/* 1. Email OTP Verification */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          emailVerified
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-slate-200 bg-white shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📧</span> Email Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Code sent to:{" "}
              <span className="font-medium text-slate-700">{email || "your email"}</span>
            </p>
          </div>
          {emailVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              ✓ Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Pending
            </span>
          )}
        </div>

        {!emailVerified && (
          <form onSubmit={handleVerifyEmail} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter Email 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono font-bold rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={emailResendCooldown > 0}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {emailResendCooldown > 0
                  ? `Resend in ${emailResendCooldown}s`
                  : "Resend Code"}
              </button>

              <Button
                type="submit"
                size="sm"
                loading={emailLoading}
                className="px-5"
              >
                Verify Email
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Mobile OTP Verification */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          mobileVerified
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-slate-200 bg-white shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📱</span> Mobile Number Verification
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-slate-500">
                Code sent to:{" "}
                <span className="font-bold text-slate-800">{phone || "your mobile"}</span>
              </p>
              {!mobileVerified && !isEditingPhone && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPhone(true);
                    setPhoneUpdateError("");
                    setPhoneUpdateSuccess("");
                    const stripped = phone
                      .replace(/^\+91/, "")
                      .replace(/^\+1/, "")
                      .replace(/^\+\d{1,4}/, "")
                      .replace(/\D/g, "");
                    setEditPhoneNumber(stripped);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-md transition-all"
                  title="Entered wrong number? Change to your actual mobile"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit / Change
                </button>
              )}
            </div>
          </div>
          {mobileVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              ✓ Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Pending
            </span>
          )}
        </div>

        {/* Success notification banner after changing phone */}
        {phoneUpdateSuccess && (
          <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{phoneUpdateSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setPhoneUpdateSuccess("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inline Edit Mobile Number Form */}
        {isEditingPhone && !mobileVerified && (
          <form onSubmit={handleUpdatePhone} className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>✏️</span> Change Mobile Number
              </span>
              <button
                type="button"
                onClick={() => setIsEditingPhone(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Entered the wrong number by mistake? Enter your actual mobile number (or Twilio test number <strong className="text-blue-700 font-mono">9582514339</strong>) to receive your SMS OTP code.
            </p>

            {phoneUpdateError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                ⚠️ {phoneUpdateError}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={editCountryCode}
                onChange={(e) => setEditCountryCode(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="IN">🇮🇳 +91 (IN)</option>
                <option value="US">🇺🇸 +1 (US)</option>
                <option value="GB">🇬🇧 +44 (UK)</option>
                <option value="AE">🇦🇪 +971 (AE)</option>
                <option value="CA">🇨🇦 +1 (CA)</option>
                <option value="AU">🇦🇺 +61 (AU)</option>
                <option value="DE">🇩🇪 +49 (DE)</option>
                <option value="SG">🇸🇬 +65 (SG)</option>
              </select>

              <input
                type="tel"
                value={editPhoneNumber}
                onKeyDown={(e) => {
                  if (
                    e.key === "0" &&
                    (!editPhoneNumber || editPhoneNumber.length === 0 || e.target.selectionStart === 0)
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d]/g, "").replace(/^0+/, "");
                  setEditPhoneNumber(sanitized);
                }}
                placeholder="9582514339 (cannot start with 0)"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                loading={phoneUpdateLoading}
                className="px-4 text-xs font-semibold"
              >
                Update & Send OTP
              </Button>
              <button
                type="button"
                onClick={() => setIsEditingPhone(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!mobileVerified && (
          <form onSubmit={handleVerifyMobile} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter Mobile 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono font-bold rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              {mobileError && (
                <p className="mt-1.5 text-xs text-red-600">{mobileError}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResendMobile}
                disabled={mobileResendCooldown > 0}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {mobileResendCooldown > 0
                  ? `Resend in ${mobileResendCooldown}s`
                  : "Resend Code"}
              </button>

              <Button
                type="submit"
                size="sm"
                loading={mobileLoading}
                className="px-5"
              >
                Verify Mobile
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Return to login
        </Link>
      </div>
    </div>
  );
}
