"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "../../hooks/useAuth";
import { getInitials } from "../../lib/utils";

// Sleek SVG Icons for executive enterprise feel
const Icons = {
  Dashboard: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Employees: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Tasks: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Attendance: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  Profile: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, isAdmin, isCeo, isHr, isManager, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: "Admin Dashboard", href: "/dashboard", Icon: Icons.Dashboard },
        { name: "Staff Directory", href: "/employees", Icon: Icons.Employees, badge: "Directory" },
        { name: "Organization Tasks", href: "/tasks", Icon: Icons.Tasks },
        { name: "Company Attendance", href: "/attendance", Icon: Icons.Attendance },
        { name: "My Profile", href: "/profile", Icon: Icons.Profile },
        { name: "Settings", href: "/settings", Icon: Icons.Settings },
      ];
    }
    if (isCeo) {
      return [
        { name: "Executive Cockpit", href: "/dashboard", Icon: Icons.Dashboard },
        { name: "Workforce Directory", href: "/employees", Icon: Icons.Employees, badge: "C-Suite" },
        { name: "Strategic Deliverables", href: "/tasks", Icon: Icons.Tasks },
        { name: "Attendance Insights", href: "/attendance", Icon: Icons.Attendance },
        { name: "My Profile", href: "/profile", Icon: Icons.Profile },
        { name: "Settings", href: "/settings", Icon: Icons.Settings },
      ];
    }
    if (isHr) {
      return [
        { name: "HR Operations Hub", href: "/dashboard", Icon: Icons.Dashboard },
        { name: "Staff Directory", href: "/employees", Icon: Icons.Employees, badge: "Roster" },
        { name: "Attendance & Leaves", href: "/attendance", Icon: Icons.Attendance },
        { name: "Company Tasks", href: "/tasks", Icon: Icons.Tasks },
        { name: "My Profile", href: "/profile", Icon: Icons.Profile },
        { name: "Settings", href: "/settings", Icon: Icons.Settings },
      ];
    }
    if (isManager) {
      return [
        { name: "Team Dashboard", href: "/dashboard", Icon: Icons.Dashboard },
        { name: "Department Roster", href: "/employees", Icon: Icons.Employees, badge: "Team" },
        { name: "Team Tasks & Sprints", href: "/tasks", Icon: Icons.Tasks },
        { name: "Shift & Attendance", href: "/attendance", Icon: Icons.Attendance },
        { name: "My Profile", href: "/profile", Icon: Icons.Profile },
        { name: "Settings", href: "/settings", Icon: Icons.Settings },
      ];
    }
    // Employee
    return [
      { name: "My Dashboard", href: "/dashboard", Icon: Icons.Dashboard },
      { name: "My Shift & Punch", href: "/attendance", Icon: Icons.Attendance },
      { name: "My Assigned Tasks", href: "/tasks", Icon: Icons.Tasks },
      { name: "My Profile & Docs", href: "/profile", Icon: Icons.Profile },
      { name: "Settings", href: "/settings", Icon: Icons.Settings },
    ];
  };

  const navItems = getNavItems();

  const portalLabel = isAdmin
    ? "Admin Console"
    : isCeo
    ? "Executive Cockpit"
    : isHr
    ? "People Operations"
    : isManager
    ? "Team Management"
    : "Employee Portal";

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/attendance") {
      return pathname.startsWith("/attendance") || pathname.startsWith("/attendence");
    }
    return pathname.startsWith(href);
  };

  const userName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const userPhoto = user?.profilePhoto?.path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Modern Deep Slate Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0F172A] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/90 bg-slate-950/40">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm shadow-xs transition group-hover:bg-blue-500">
              E
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                Employee<span className="text-blue-400">Hub</span>
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 -mt-0.5">
                {portalLabel}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition lg:hidden"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Menu
          </p>

          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-slate-800 text-white shadow-2xs border-l-2 border-blue-500 pl-2.5"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`transition ${active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}`}>
                    <item.Icon />
                  </span>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    active ? "bg-white/10 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Quick Logout */}
        <div className="border-t border-slate-800/90 p-3 bg-slate-950/40">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 mb-2">
            <div className="relative">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-white text-xs overflow-hidden border border-slate-700">
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
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {userName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isAdmin
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : isCeo
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : isHr
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isManager
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}>
                  {user?.role || "Employee"}
                </span>
                <span className="text-[10px] text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition duration-150"
          >
            <Icons.Logout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
