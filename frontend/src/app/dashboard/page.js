"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import api from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { formatDate, formatTime, getPriorityBadgeClass, getStatusBadgeClass } from "../../lib/utils";

// Clean, Pixel-Aligned SVG Stroke Icons (No AI emojis)
const Icons = {
  Users: () => (
    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  ),
};

export default function DashboardPage() {
  const { user, isAdmin, isCeo, isHr, isManager, isEmployee, role, loading: authLoading, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [elapsedShiftTime, setElapsedShiftTime] = useState("");

  // Running local clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/stats");
      setData(res || null);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchDashboardData();
  }, [authLoading, isAuthenticated]);

  const todayAtt = data?.todayAttendance || data?.data?.todayAttendance;

  // Running shift elapsed timer
  useEffect(() => {
    if (!todayAtt?.checkIn || todayAtt?.checkOut) {
      setElapsedShiftTime("");
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(todayAtt.checkIn).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedShiftTime(
        `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(timer);
  }, [todayAtt?.checkIn, todayAtt?.checkOut]);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      setActionMessage("");
      await api.post("/api/attendance/check-in");
      setActionMessage("Clock-in recorded. Your daily shift has started.");
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      setActionMessage("");
      await api.post("/api/attendance/check-out");
      setActionMessage("Clock-out recorded. Shift completed for today.");
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to check out");
    } finally {
      setCheckingOut(false);
    }
  };

  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const nextStatus =
        currentStatus === "Pending"
          ? "In Progress"
          : currentStatus === "In Progress"
          ? "Completed"
          : "In Progress";

      await api.patch(`/api/tasks/${taskId}/status`, { status: nextStatus });
      setActionMessage(`Task marked as "${nextStatus}".`);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading && !data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-96 items-center justify-center">
          <Loader size="lg" message="Loading your dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || data?.data?.stats || {};
  const totalStaff = stats.totalEmployees || 0;
  const presentToday = stats.attendanceToday?.present || 0;
  const attendanceRate = totalStaff > 0 ? Math.round((presentToday / totalStaff) * 100) : 0;
  const totalTasksCount =
    stats.totalTasks ||
    (stats.pendingTasks || 0) + (stats.completedTasks || 0) + (stats.inProgressTasks || 0);

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subtitle = isAdmin
    ? "Company Administration • Complete organizational health, staff, and operations"
    : isCeo
    ? "Executive Cockpit • Strategic workforce metrics, project delivery velocity, and company growth"
    : isHr
    ? "People Operations • Active workforce, onboarding pipeline, and attendance tracking"
    : isManager
    ? `${user?.department || "Team"} Operations • Deliverables, sprint roadmap, and department roster`
    : "Personal Workspace • Daily schedule, shift tracking, and deliverables";

  const portalBadge = isAdmin
    ? { title: "Admin Console", className: "bg-purple-900 text-purple-100" }
    : isCeo
    ? { title: "Executive Cockpit", className: "bg-amber-800 text-amber-100" }
    : isHr
    ? { title: "People Operations", className: "bg-emerald-800 text-emerald-100" }
    : isManager
    ? { title: "Team Leadership", className: "bg-indigo-800 text-indigo-100" }
    : { title: "Employee Portal", className: "bg-blue-50 text-blue-700 border border-blue-200/60" };

  const actionButton = isAdmin || isHr ? (
    <Link href="/employees/add">
      <Button size="sm" variant="primary">
        <Icons.Plus />
        <span>Add Employee</span>
      </Button>
    </Link>
  ) : isCeo || isManager ? (
    <Link href="/tasks">
      <Button size="sm" variant="primary">
        <Icons.Plus />
        <span>Assign Task</span>
      </Button>
    </Link>
  ) : (
    <Link href="/tasks">
      <Button size="sm" variant="primary">
        <span>View My Tasks</span>
      </Button>
    </Link>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={subtitle}
      action={actionButton}
    >
      <div className="space-y-6">
        {/* Natural Executive Header Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {greeting}, {firstName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${portalBadge.className}`}
                >
                  {portalBadge.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {subtitle}
              </p>
            </div>

            {/* Live Clock & Date Badge */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 self-start md:self-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-slate-600 shadow-2xs">
                <Icons.Clock />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">{todayDateFormatted}</p>
                <p className="font-mono text-sm font-bold text-slate-900">{currentTime || "--:--:--"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Message Feedback */}
        {actionMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                ✓
              </span>
              <span>{actionMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* ----------------- 1. ADMIN DASHBOARD ----------------- */}
        {isAdmin && (
          <>
            {/* Top 4 Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Personnel</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                    <Icons.Users />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{totalStaff}</p>
                  <span className="text-xs font-medium text-slate-500">registered</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {stats.activeEmployees || 0} active
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {stats.onLeaveEmployees || 0} on leave
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Present Today</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                    <Icons.Calendar />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{presentToday}</p>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {attendanceRate}% rate
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>{stats.attendanceToday?.absent || 0} absent</span>
                  <span className="text-slate-300">•</span>
                  <span>{stats.attendanceToday?.onLeave || 0} approved leave</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tasks In Progress</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                    <Icons.Clock />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {stats.inProgressTasks || 0}
                  </p>
                  <span className="text-xs font-medium text-slate-500">of {totalTasksCount} total</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span className="text-amber-700 font-medium">{stats.pendingTasks || 0} pending</span>
                  <Link href="/tasks" className="font-semibold text-blue-600 hover:text-blue-700">
                    Task Board →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Completed Deliverables</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                    <Icons.CheckCircle />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {stats.completedTasks || 0}
                  </p>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {totalTasksCount > 0
                      ? Math.round(((stats.completedTasks || 0) / totalTasksCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>{totalTasksCount} total tasks logged</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/employees/add"
                className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70 transition group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Onboard Employee</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Add to directory</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Icons.Plus />
                </div>
              </Link>

              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70 transition group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Assign Task</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Delegate work</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Icons.CheckCircle />
                </div>
              </Link>

              <Link
                href="/attendance"
                className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70 transition group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Attendance Log</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Review punch times</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Icons.Calendar />
                </div>
              </Link>

              <Link
                href="/employees"
                className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70 transition group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Staff Directory</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage members</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Icons.Users />
                </div>
              </Link>
            </div>

            {/* Middle Section: Department Distribution & Recent Deliverables */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card
                title="Department Headcount"
                subtitle="Click any department to filter staff directory"
                action={
                  <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    All Staff →
                  </Link>
                }
                className="lg:col-span-1"
              >
                <div className="space-y-4">
                  {(stats.departmentDistribution || []).map((dept) => {
                    const pct = totalStaff > 0 ? Math.round((dept.count / totalStaff) * 100) : 0;
                    return (
                      <Link
                        key={dept.department}
                        href={`/employees?department=${encodeURIComponent(dept.department)}`}
                        className="block group space-y-1.5 hover:opacity-90 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                            {dept.department}
                          </span>
                          <span className="font-medium text-slate-500">
                            {dept.count} {dept.count === 1 ? "member" : "members"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-800 group-hover:bg-blue-600 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>

              <Card
                title="Active Team Tasks"
                subtitle="Live status across squads • Click status to transition"
                action={
                  <Link
                    href="/tasks"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1"
                  >
                    <span>View Kanban</span>
                    <Icons.ArrowUpRight />
                  </Link>
                }
                className="lg:col-span-2"
              >
                <div className="divide-y divide-slate-100">
                  {(data?.recentTasks || data?.data?.recentTasks || []).map((t) => (
                    <div
                      key={t._id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Assigned to:{" "}
                          <span className="font-medium text-slate-700">
                            {t.assignedTo?.fullName ||
                              `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`}
                          </span>{" "}
                          • Due: {formatDate(t.dueDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getPriorityBadgeClass(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                        <button
                          type="button"
                          disabled={updatingTaskId === t._id}
                          onClick={() => handleTaskStatusToggle(t._id, t.status)}
                          title="Click to transition task status"
                          className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 ${getStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {updatingTaskId === t._id ? "Updating..." : t.status}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!data?.recentTasks || data.recentTasks.length === 0) && (
                    <p className="text-xs text-slate-400 py-6 text-center">No active tasks logged yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ----------------- 2. CEO EXECUTIVE COCKPIT ----------------- */}
        {isCeo && (
          <>
            {/* Top 4 Executive KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800">Total Workforce</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Icons.Users />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{totalStaff}</p>
                  <span className="text-xs font-medium text-slate-500">personnel</span>
                </div>
                <p className="mt-2 text-xs text-amber-700 font-medium border-t border-amber-100 pt-2">
                  {stats.activeEmployees || 0} active in organization
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Company Attendance</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Icons.Calendar />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{attendanceRate}%</p>
                  <span className="text-xs font-medium text-emerald-600">{presentToday} present today</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  Daily participation rate across squads
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Project Velocity</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                    <Icons.CheckCircle />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {totalTasksCount > 0 ? Math.round(((stats.completedTasks || 0) / totalTasksCount) * 100) : 0}%
                  </p>
                  <span className="text-xs font-medium text-slate-500">{stats.completedTasks || 0} completed</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  {stats.inProgressTasks || 0} tasks currently in flight
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Business Units</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                    <Icons.Briefcase />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {(stats.departmentDistribution || []).length}
                  </p>
                  <span className="text-xs font-medium text-slate-500">departments</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  Fully operational organizational pods
                </p>
              </div>
            </div>

            {/* CEO Executive Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs hover:border-amber-300 hover:bg-amber-50/40 transition group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Assign Strategic Task</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Delegate work</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Icons.Plus />
                </div>
              </Link>

              <Link
                href="/employees"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Workforce Directory</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">All staff files</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Users />
                </div>
              </Link>

              <Link
                href="/attendance"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Attendance Insights</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Punctuality logs</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Calendar />
                </div>
              </Link>

              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Sprint Kanban</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Company board</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.CheckCircle />
                </div>
              </Link>
            </div>

            {/* CEO Middle Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card
                title="Workforce Allocation by Department"
                subtitle="Click any business unit to view personnel roster"
                action={
                  <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                    Staff Directory →
                  </Link>
                }
              >
                <div className="space-y-4">
                  {(stats.departmentDistribution || []).map((dept) => {
                    const pct = totalStaff > 0 ? Math.round((dept.count / totalStaff) * 100) : 0;
                    return (
                      <Link
                        key={dept.department}
                        href={`/employees?department=${encodeURIComponent(dept.department)}`}
                        className="block group space-y-1.5 hover:opacity-90 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 group-hover:text-amber-800 transition">
                            {dept.department}
                          </span>
                          <span className="font-medium text-slate-500">
                            {dept.count} {dept.count === 1 ? "person" : "people"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-600 group-hover:bg-amber-700 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>

              <Card
                title="Strategic Deliverables"
                subtitle="High-impact tasks underway • Click status to transition"
                action={
                  <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                    All Tasks →
                  </Link>
                }
              >
                <div className="divide-y divide-slate-100">
                  {(data?.recentTasks || data?.data?.recentTasks || []).map((t) => (
                    <div key={t._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Owner:{" "}
                          <span className="font-medium text-slate-700">
                            {t.assignedTo?.fullName ||
                              `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.trim() ||
                              "Staff"}
                          </span>{" "}
                          • Due: {formatDate(t.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                        <button
                          type="button"
                          disabled={updatingTaskId === t._id}
                          onClick={() => handleTaskStatusToggle(t._id, t.status)}
                          title="Click to transition status"
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 ${getStatusBadgeClass(t.status)}`}
                        >
                          {updatingTaskId === t._id ? "Updating..." : t.status}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!data?.recentTasks || data.recentTasks.length === 0) && (
                    <p className="text-xs text-slate-400 py-6 text-center">No strategic deliverables registered.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ----------------- 3. HR OPERATIONS HUB ----------------- */}
        {isHr && (
          <>
            {/* Top 4 HR KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Total Workforce</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Icons.Users />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{totalStaff}</p>
                  <span className="text-xs font-medium text-slate-500">registered staff</span>
                </div>
                <p className="mt-2 text-xs text-emerald-700 font-medium border-t border-emerald-100 pt-2">
                  {stats.activeEmployees || 0} actively employed
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Present Today</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icons.Calendar />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{presentToday}</p>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {attendanceRate}% present
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  {stats.attendanceToday?.absent || 0} absent today
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">On Leave Today</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Icons.Clock />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {stats.attendanceToday?.onLeave || stats.onLeaveEmployees || 0}
                  </p>
                  <span className="text-xs font-medium text-slate-500">approved leaves</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  Planned absence roster
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Unmarked Attendance</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                    <Icons.Calendar />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {stats.attendanceToday?.absent || 0}
                  </p>
                  <span className="text-xs font-medium text-red-600">missing records</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  Requires attendance verification
                </p>
              </div>
            </div>

            {/* HR Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/employees/add"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/40 transition group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Onboard Employee</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">New hire registration</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Icons.Plus />
                </div>
              </Link>

              <Link
                href="/employees"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Staff Directory</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage employee records</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Users />
                </div>
              </Link>

              <Link
                href="/attendance"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Attendance & Timesheets</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Approve daily punch logs</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Calendar />
                </div>
              </Link>

              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Workforce Tasks</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cross-team assignments</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.CheckCircle />
                </div>
              </Link>
            </div>

            {/* HR Middle Section: Shift Punch Card + Department Workforce Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* HR Personal Shift Card */}
              <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        My Shift & Attendance
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{todayDateFormatted}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icons.Clock />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-xs font-medium text-slate-600">Shift Status:</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          todayAtt?.status || "Pending"
                        )}`}
                      >
                        {todayAtt?.status || "Not Checked In"}
                      </span>
                    </div>

                    {todayAtt?.checkIn && (
                      <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Clock-In:</span>
                          <span className="font-mono font-bold text-slate-900">{formatTime(todayAtt.checkIn)}</span>
                        </div>
                        {elapsedShiftTime && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">Elapsed:</span>
                            <span className="font-mono font-semibold text-emerald-700">{elapsedShiftTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {!todayAtt?.checkIn ? (
                    <Button
                      onClick={handleCheckIn}
                      loading={checkingIn}
                      size="md"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      Clock In (Start Shift)
                    </Button>
                  ) : !todayAtt?.checkOut ? (
                    <Button
                      onClick={handleCheckOut}
                      loading={checkingOut}
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      Clock Out (End Shift)
                    </Button>
                  ) : (
                    <div className="text-center w-full bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-800">
                      ✓ Shift Completed for Today
                    </div>
                  )}
                </div>
              </div>

              {/* Department Workforce Allocation Breakdown */}
              <Card
                title="Department Workforce Breakdown"
                subtitle="Click department to filter employee directory"
                action={
                  <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                    All Staff →
                  </Link>
                }
                className="lg:col-span-2"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {(stats.departmentDistribution || []).map((dept) => {
                    const pct = totalStaff > 0 ? Math.round((dept.count / totalStaff) * 100) : 0;
                    return (
                      <Link
                        key={dept.department}
                        href={`/employees?department=${encodeURIComponent(dept.department)}`}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/40 transition group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-slate-800 group-hover:text-emerald-800 transition">
                            {dept.department}
                          </span>
                          <span className="font-medium text-slate-500">
                            {dept.count} {dept.count === 1 ? "person" : "people"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                          <div
                            className="h-full rounded-full bg-emerald-600 group-hover:bg-emerald-700 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Bottom Section: Recent Personnel Registrations + Active Workforce Deliverables */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* HR Recent Personnel */}
              <Card
                title="Recent Personnel Registrations"
                subtitle="Recently added employee files and verification status"
                action={
                  <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                    View Full Directory →
                  </Link>
                }
              >
                <div className="divide-y divide-slate-100">
                  {(data?.recentEmployees || []).map((emp) => (
                    <div key={emp._id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.email} • {emp.department} • {emp.employmentType}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {emp.role || "employee"}
                        </span>
                        <Link
                          href={`/employees/${emp._id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md"
                        >
                          View File →
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!data?.recentEmployees || data.recentEmployees.length === 0) && (
                    <p className="text-xs text-slate-400 py-6 text-center">No employee records found.</p>
                  )}
                </div>
              </Card>

              {/* Workforce Tasks with Inline Status Transition */}
              <Card
                title="Workforce Deliverables"
                subtitle="High-priority organizational tasks • Click status to transition"
                action={
                  <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                    Manage Tasks →
                  </Link>
                }
              >
                <div className="divide-y divide-slate-100">
                  {(data?.recentTasks || data?.data?.recentTasks || []).map((t) => (
                    <div key={t._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Assigned:{" "}
                          <span className="font-medium text-slate-700">
                            {t.assignedTo?.fullName ||
                              `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.trim() ||
                              "Staff"}
                          </span>{" "}
                          • Due: {formatDate(t.dueDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getPriorityBadgeClass(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                        <button
                          type="button"
                          disabled={updatingTaskId === t._id}
                          onClick={() => handleTaskStatusToggle(t._id, t.status)}
                          title="Click to transition task status"
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 ${getStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {updatingTaskId === t._id ? "Updating..." : t.status}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!data?.recentTasks || data.recentTasks.length === 0) && (
                    <p className="text-xs text-slate-400 py-6 text-center">No tasks currently logged.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ----------------- 4. MANAGER TEAM HUB ----------------- */}
        {isManager && (
          <>
            {/* Top Row: Shift Card + Team Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Manager Personal Shift Punch Card */}
              <div className="rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        My Shift & Attendance
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{todayDateFormatted}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                      <Icons.Clock />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-xs font-medium text-slate-600">Shift Status:</span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(todayAtt?.status || "Pending")}`}>
                        {todayAtt?.status || "Not Checked In"}
                      </span>
                    </div>

                    {todayAtt?.checkIn && (
                      <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Clock-In:</span>
                          <span className="font-mono font-bold text-slate-900">{formatTime(todayAtt.checkIn)}</span>
                        </div>
                        {elapsedShiftTime && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">Elapsed:</span>
                            <span className="font-mono font-semibold text-emerald-700">{elapsedShiftTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {!todayAtt?.checkIn ? (
                    <Button onClick={handleCheckIn} loading={checkingIn} size="md" className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Clock In (Start Shift)
                    </Button>
                  ) : !todayAtt?.checkOut ? (
                    <Button onClick={handleCheckOut} loading={checkingOut} variant="secondary" size="md" className="w-full">
                      Clock Out (End Shift)
                    </Button>
                  ) : (
                    <div className="text-center w-full bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-800">
                      ✓ Shift Completed for Today
                    </div>
                  )}
                </div>
              </div>

              {/* Department Team Metrics */}
              <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Department Team Size</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icons.Users />
                    </div>
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {data?.stats?.teamMembersCount || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Colleagues in {user?.department || "Department"}</p>
                  </div>
                  <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                    View Department Directory →
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Team Present Today</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icons.Calendar />
                    </div>
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {data?.stats?.teamPresentToday || 0}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Clocked in today</p>
                  </div>
                  <Link href="/attendance" className="text-xs font-semibold text-blue-600 hover:underline">
                    Review Shift Logs →
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">In Progress Deliverables</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Icons.Clock />
                    </div>
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {data?.stats?.inProgressTasks || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Active sprint tasks</p>
                  </div>
                  <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                    Sprint Kanban →
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Tasks Completed</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                      <Icons.CheckCircle />
                    </div>
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {data?.stats?.completedTasks || 0}
                    </p>
                    <p className="text-xs text-blue-700 font-medium mt-1">Delivered successfully</p>
                  </div>
                  <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                    Deliverables Board →
                  </Link>
                </div>
              </div>
            </div>

            {/* Manager Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-indigo-200/80 bg-white p-3.5 shadow-2xs hover:border-indigo-300 hover:bg-indigo-50/40 transition group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Delegate Task</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Assign to squad</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Icons.Plus />
                </div>
              </Link>

              <Link
                href="/attendance"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Shift Logs</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Department attendance</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Calendar />
                </div>
              </Link>

              <Link
                href="/employees"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Department Directory</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">View squad profiles</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Users />
                </div>
              </Link>

              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Sprint Kanban</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Task workflow</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.CheckCircle />
                </div>
              </Link>
            </div>

            {/* Department Active Deliverables */}
            <Card
              title={`${user?.department || "Department"} Active Deliverables`}
              subtitle="Live status of assigned tasks in your squad • Click status to transition"
              action={
                <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                  Full Board →
                </Link>
              }
            >
              <div className="divide-y divide-slate-100">
                {(data?.recentTasks || data?.data?.recentTasks || []).map((t) => (
                  <div key={t._id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Assigned to:{" "}
                        <span className="font-medium text-slate-700">
                          {t.assignedTo?.fullName ||
                            `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.trim() ||
                            "Colleague"}
                        </span>{" "}
                        • Due: {formatDate(t.dueDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                      <button
                        type="button"
                        disabled={updatingTaskId === t._id}
                        onClick={() => handleTaskStatusToggle(t._id, t.status)}
                        title="Click to transition task status"
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 ${getStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {updatingTaskId === t._id ? "Updating..." : t.status}
                      </button>
                    </div>
                  </div>
                ))}
                {(!data?.recentTasks || data.recentTasks.length === 0) && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-400">No active deliverables logged for this department.</p>
                    <Link href="/tasks" className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline">
                      + Create First Task
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Department Team Members Roster (Clickable) */}
            <Card
              title={`${user?.department || "Department"} Team Roster`}
              subtitle="Colleagues reporting or working within your division • Click to inspect profile"
              action={
                <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                  Full Roster →
                </Link>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.teamMembers || []).map((member) => (
                  <Link
                    key={member._id}
                    href={`/employees/${member._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/40 transition group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-indigo-200 transition">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-900 transition">
                        {member.fullName || `${member.firstName} ${member.lastName}`}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition">
                      →
                    </span>
                  </Link>
                ))}
                {(!data?.teamMembers || data.teamMembers.length === 0) && (
                  <p className="text-xs text-slate-400 py-6 text-center col-span-3">No colleagues in this department yet.</p>
                )}
              </div>
            </Card>
          </>
        )}

        {/* ----------------- 5. EMPLOYEE WORKSPACE ----------------- */}
        {isEmployee && !isAdmin && !isCeo && !isHr && !isManager && (
          <>
            {/* Employee Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/tasks"
                className="flex items-center justify-between rounded-xl border border-blue-200/80 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:bg-blue-50/40 transition group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">My Task Kanban</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active sprint board</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Icons.CheckCircle />
                </div>
              </Link>

              <Link
                href="/attendance"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Shift History</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Daily punch logs</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Calendar />
                </div>
              </Link>

              <Link
                href="/profile"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">My Profile & Docs</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Employment record</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Briefcase />
                </div>
              </Link>

              <Link
                href="/employees"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Department Directory</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Connect with peers</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icons.Users />
                </div>
              </Link>
            </div>

            {/* Top 3 Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Daily Shift Punch Card */}
              <div className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Daily Shift & Attendance
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{todayDateFormatted}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Icons.Clock />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-xs font-medium text-slate-600">Shift Status:</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          todayAtt?.status || "Pending"
                        )}`}
                      >
                        {todayAtt?.status || "Not Checked In"}
                      </span>
                    </div>

                    {todayAtt?.checkIn && (
                      <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Clock-In Time:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatTime(todayAtt.checkIn)}
                          </span>
                        </div>
                        {elapsedShiftTime && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">Active Duration:</span>
                            <span className="font-mono font-semibold text-emerald-700">
                              {elapsedShiftTime}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {todayAtt?.checkOut && (
                      <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Clock-Out Time:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatTime(todayAtt.checkOut)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {!todayAtt?.checkIn ? (
                    <Button onClick={handleCheckIn} loading={checkingIn} size="md" className="w-full bg-blue-600 hover:bg-blue-700">
                      Clock In (Start Shift)
                    </Button>
                  ) : !todayAtt?.checkOut ? (
                    <Button
                      onClick={handleCheckOut}
                      loading={checkingOut}
                      variant="secondary"
                      size="md"
                      className="w-full border-slate-300"
                    >
                      Clock Out (End Shift)
                    </Button>
                  ) : (
                    <div className="text-center w-full bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-800">
                      ✓ Shift Completed for Today
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Summary Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">My Deliverables</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Assigned work items</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icons.CheckCircle />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <p className="text-xl font-bold text-slate-900">{stats.pendingTasks || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase">Pending</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <p className="text-xl font-bold text-blue-600">{stats.inProgressTasks || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase">In Flight</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <p className="text-xl font-bold text-emerald-700">{stats.completedTasks || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase">Done</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/tasks">
                    <Button variant="secondary" size="md" className="w-full border-slate-300">
                      <span>Open Task Board</span>
                      <Icons.ArrowUpRight />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Personal Details Snapshot */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Profile Details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Employment record</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icons.Briefcase />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-500 font-medium">Department</span>
                      <span className="font-semibold text-slate-900">
                        {user?.department || "Engineering"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-500 font-medium">Contract Type</span>
                      <span className="font-semibold text-slate-900">
                        {user?.employmentType || "Full Time"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-500 font-medium">Email</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[170px]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/profile">
                    <Button variant="outline" size="md" className="w-full border-slate-300">
                      Manage Profile & Documents
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Middle Section: Interactive Assigned Deliverables & Deadlines/Teammates */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* My Assigned Tasks List with Inline Status Toggles */}
              <Card
                title="My Deliverables & Sprint Items"
                subtitle="Active work items assigned to you • Click action to update progress"
                action={
                  <Link
                    href="/tasks"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1"
                  >
                    <span>Full Kanban</span>
                    <Icons.ArrowUpRight />
                  </Link>
                }
                className="lg:col-span-2"
              >
                <div className="divide-y divide-slate-100">
                  {(data?.recentTasks || data?.data?.recentTasks || []).map((t) => (
                    <div
                      key={t._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{t.title}</p>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeClass(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        {t.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          Due: <span className="font-semibold text-slate-600">{formatDate(t.dueDate)}</span>
                          {t.createdBy && (
                            <span> • Assigned by {t.createdBy.fullName || t.createdBy.firstName || "Manager"}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>

                        {t.status === "Pending" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={updatingTaskId === t._id}
                            onClick={() => handleTaskStatusToggle(t._id, t.status)}
                            className="text-xs py-1 px-2.5 h-auto text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
                          >
                            {updatingTaskId === t._id ? "..." : "Start Task"}
                          </Button>
                        ) : t.status === "In Progress" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={updatingTaskId === t._id}
                            onClick={() => handleTaskStatusToggle(t._id, t.status)}
                            className="text-xs py-1 px-2.5 h-auto bg-emerald-600 hover:bg-emerald-700"
                          >
                            {updatingTaskId === t._id ? "..." : "Mark Complete ✓"}
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            Done ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!data?.recentTasks || data.recentTasks.length === 0) && (
                    <div className="py-10 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-2">
                        ✓
                      </div>
                      <p className="text-xs font-semibold text-slate-700">All deliverables up to date!</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Check with your squad lead or browse the task board.</p>
                      <Link href="/tasks" className="inline-block mt-3 text-xs font-bold text-blue-600 hover:underline">
                        Open Task Board →
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Department Teammates & Deadlines Column */}
              <div className="space-y-6 lg:col-span-1">
                {/* Upcoming Deadlines */}
                <Card
                  title="Upcoming Deadlines"
                  subtitle="Critical milestones on your schedule"
                >
                  <div className="space-y-3">
                    {(data?.upcomingDeadlines || []).map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-slate-900 truncate">{t.title}</p>
                          <p className="text-[11px] text-slate-500">{formatDate(t.dueDate)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                    {(!data?.upcomingDeadlines || data.upcomingDeadlines.length === 0) && (
                      <p className="text-xs text-slate-400 py-3 text-center">No urgent deadlines pending.</p>
                    )}
                  </div>
                </Card>

                {/* Department Colleagues */}
                <Card
                  title={`${user?.department || "Team"} Colleagues`}
                  subtitle="Teammates in your department"
                  action={
                    <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                      Directory →
                    </Link>
                  }
                >
                  <div className="space-y-2.5">
                    {(data?.teamColleagues || []).map((peer) => (
                      <Link
                        key={peer._id}
                        href={`/employees/${peer._id}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                          {peer.firstName?.[0]}{peer.lastName?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                            {peer.fullName || `${peer.firstName} ${peer.lastName}`}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{peer.email}</p>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition">→</span>
                      </Link>
                    ))}
                    {(!data?.teamColleagues || data.teamColleagues.length === 0) && (
                      <p className="text-xs text-slate-400 py-3 text-center">No other members listed.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
