"use client";

import React, { useState } from "react";
import api from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [preferences, setPreferences] = useState({
    notifications: true,
    weeklySummary: true,
    taskAlerts: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError(
        "New password must be at least 8 characters long and contain at least one letter and one number"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Settings & Security"
      subtitle="Manage your password, account credentials, and platform preferences"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Change Password Card */}
        <Card
          title="Change Password"
          subtitle="Ensure your account is using a long, random password to stay secure"
        >
          {passwordSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
              ✓ {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              ⚠️ {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <PasswordInput
                  label="New Password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, letter + number"
                />
              </div>

              <div>
                <PasswordInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} size="sm">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Notifications & Preferences Card */}
        <Card
          title="Account Preferences"
          subtitle="Customize your platform notification and workspace behavior"
        >
          <div className="space-y-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Email Notifications
                </p>
                <p className="text-xs text-slate-500">
                  Receive email alerts for task assignments and daily updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("notifications")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.notifications ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Weekly Performance Summary
                </p>
                <p className="text-xs text-slate-500">
                  Get a digest of tasks completed and attendance hours every Monday.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("weeklySummary")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.weeklySummary ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    preferences.weeklySummary ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Task Deadline Reminders
                </p>
                <p className="text-xs text-slate-500">
                  Receive reminders 24 hours before assigned task due dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("taskAlerts")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.taskAlerts ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    preferences.taskAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
