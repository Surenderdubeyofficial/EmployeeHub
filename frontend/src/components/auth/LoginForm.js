"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import GoogleAuthButton from "./GoogleAuthButton";

export default function LoginForm() {
  const router = useRouter();
  const { login, loginWithToken, loginWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState("password"); // "password" | "otp"

  // Password mode states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP mode states
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");

  // Cooldown effect
  React.useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const data = await login(email.trim(), password);

      if (data?.requiresVerification && data?.user) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            data.user.email || email.trim()
          )}&phone=${encodeURIComponent(data.user.phone || "")}`
        );
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setErrors({
        general:
          err.message || "Invalid credentials. Please check and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpIdentifier.trim()) {
      setErrors({ general: "Please enter your registered email or phone number" });
      return;
    }

    setOtpSending(true);
    setErrors({});
    setOtpSuccessMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: otpIdentifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP code");
      }
      setOtpSent(true);
      setOtpCooldown(60);
      setOtpSuccessMessage(data.message || "Verification code dispatched successfully!");
    } catch (err) {
      setErrors({ general: err.message || "Could not send verification OTP" });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrors({ general: "Please enter the 6-digit OTP code received" });
      return;
    }

    setOtpVerifying(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: otpIdentifier.trim(),
          otp: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired OTP code");
      }

      loginWithToken(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setErrors({ general: err.message || "Invalid OTP code. Please try again." });
    } finally {
      setOtpVerifying(false);
    }
  };



  return (
    <div className="w-full">
      {/* Auth Mode Toggle Tabs */}
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setErrors({});
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
            authMode === "password"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Password Sign-In
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("otp");
            setErrors({});
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
            authMode === "otp"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Mobile / Email OTP
        </button>
      </div>

      {errors.general && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {errors.general}
        </div>
      )}

      {otpSuccessMessage && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          ✓ {otpSuccessMessage}
        </div>
      )}

      {authMode === "password" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              placeholder="name@company.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
            />
          </div>

          <div>
            <PasswordInput
              label="Password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full shadow-sm"
            >
              Sign in with Password
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Email or Mobile Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={otpSent}
                value={otpIdentifier}
                onChange={(e) => {
                  let val = e.target.value;
                  if (/^\d+$/.test(val) && val.startsWith("0")) {
                    val = val.replace(/^0+/, "");
                  }
                  setOtpIdentifier(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "0" && !otpIdentifier) {
                    e.preventDefault();
                  }
                }}
                placeholder="e.g. 9582514339 or user@gmail.com"
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
              {!otpSent ? (
                <Button
                  type="button"
                  size="md"
                  loading={otpSending}
                  onClick={handleSendOtp}
                  className="shrink-0"
                >
                  Send OTP
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2"
                >
                  Change
                </button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Indian mobile numbers can be entered with or without +91.
            </p>
          </div>

          {otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-xl font-mono font-bold rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={otpCooldown > 0 || otpSending}
                  onClick={handleSendOtp}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {otpCooldown > 0
                    ? `Resend OTP in ${otpCooldown}s`
                    : "Resend OTP Code"}
                </button>
              </div>

              <Button
                type="submit"
                loading={otpVerifying}
                size="lg"
                className="w-full shadow-sm"
              >
                Verify & Sign In
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Google Sign In */}
      <GoogleAuthButton
        mode="signin"
        onError={(msg) => setErrors({ general: msg })}
      />
    </div>
  );
}
