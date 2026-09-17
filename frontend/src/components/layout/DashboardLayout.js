"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import Loader from "../ui/Loader";
import CommandPalette from "../ui/CommandPalette";
import NotificationDropdown from "../ui/NotificationDropdown";
import { getInitials } from "../../lib/utils";

export default function DashboardLayout({
  children,
  title,
  subtitle,
  action,
  requireAdmin = false,
  allowedRoles = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, isAdmin, isCeo, isHr, isManager, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const userRole = user?.role || "employee";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    } else if (!loading && requireAdmin && !isAdmin) {
      router.replace("/dashboard");
    } else if (!loading && allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, requireAdmin, isAdmin, allowedRoles, userRole, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" message="Loading EmployeeHub OS..." />
      </div>
    );
  }

  const isAccessDenied = (requireAdmin && !isAdmin) || (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(userRole));
  if (!isAuthenticated || isAccessDenied) {
    return null;
  }

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const userName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const userPhoto = user?.profilePhoto?.path;

  // Breadcrumbs generation
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={setCommandPaletteOpen}
      />

      {/* Modern Deep Slate Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Glassmorphism Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          {/* Left: Mobile Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <Link href="/dashboard" className="font-semibold text-slate-500 hover:text-blue-600 transition truncate">
                Workspace
              </Link>
              {pathSegments.map((segment, idx) => (
                <React.Fragment key={segment}>
                  <span>/</span>
                  <span className={`capitalize truncate ${
                    idx === pathSegments.length - 1 ? "font-bold text-slate-800" : "text-slate-500"
                  }`}>
                    {segment}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Center Search / Command Trigger */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 transition shadow-2xs w-64 lg:w-72"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="flex-1 text-left truncate">Search or jump to...</span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Notifications, Date, Actions, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Live Date Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{todayFormatted}</span>
            </div>

            {/* Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Custom Page Action */}
            {action && <div className="shrink-0">{action}</div>}

            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white overflow-hidden transition group-hover:bg-slate-800">
                  {userPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={
                        userPhoto.startsWith("http")
                          ? userPhoto
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${userPhoto}`
                      }
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(userName)
                  )}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[110px] group-hover:text-blue-600 transition">
                    {userName}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                      isAdmin
                        ? "bg-purple-900 text-purple-100"
                        : isCeo
                        ? "bg-amber-800 text-amber-100"
                        : isHr
                        ? "bg-emerald-800 text-emerald-100"
                        : isManager
                        ? "bg-indigo-800 text-indigo-100"
                        : "bg-blue-50 text-blue-700 border border-blue-200/60"
                    }`}
                  >
                    {user?.role || "Employee"}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
