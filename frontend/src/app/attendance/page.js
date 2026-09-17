"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loader from "../../components/ui/Loader";
import { formatDate, formatTime, getStatusBadgeClass } from "../../lib/utils";

export default function AttendancePage() {
  const { user, isAdmin, isCeo, isHr, isManager, isEmployee, loading: authLoading, isAuthenticated } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManageAttendance = isAdmin || isHr || isManager || isCeo;
  const canMarkAttendance = isAdmin || isHr || isManager;

  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("All");

  // Mark Attendance Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    employee: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present",
    notes: "",
  });
  const [markLoading, setMarkLoading] = useState(false);

  // Check-in/out states
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter) params.append("date", dateFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const [attRes, todayRes, empRes] = await Promise.all([
        api.get(`/api/attendance?${params.toString()}`),
        api.get("/api/attendance/today"),
        canManageAttendance ? api.get("/api/employees") : Promise.resolve({ data: { employees: [] } }),
      ]);

      setAttendance(attRes?.attendance || attRes?.data?.attendance || []);
      setTodayRecord(todayRes?.attendance || todayRes?.data?.attendance || null);
      setEmployees(empRes?.employees || empRes?.data?.employees || []);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchAttendance();
  }, [dateFilter, statusFilter, authLoading, isAuthenticated]);

  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);
      setActionSuccess("");
      await api.post("/api/attendance/check-in");
      setActionSuccess("Arrival checked in successfully! Shift is now running.");
      await fetchAttendance();
    } catch (err) {
      alert(err.message || "Failed to check in");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckOutLoading(true);
      setActionSuccess("");
      await api.post("/api/attendance/check-out");
      setActionSuccess("Departure recorded successfully! Shift finished for today.");
      await fetchAttendance();
    } catch (err) {
      alert(err.message || "Failed to check out");
    } finally {
      setCheckOutLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!markForm.employee) {
      alert("Please select an employee");
      return;
    }

    try {
      setMarkLoading(true);
      await api.post("/api/attendance", markForm);
      setIsMarkModalOpen(false);
      await fetchAttendance();
      setActionSuccess("Manual attendance record created successfully!");
    } catch (err) {
      alert(err.message || "Failed to record attendance");
    } finally {
      setMarkLoading(false);
    }
  };

  // Export CSV generator
  const handleExportAttendanceCSV = () => {
    if (!attendance || attendance.length === 0) {
      alert("No attendance logs available to export.");
      return;
    }

    const headers = ["ID", "Employee Name", "Department", "Date", "Check In", "Check Out", "Status", "Notes"];
    const rows = attendance.map((rec) => {
      const empName = rec.employee?.fullName || `${rec.employee?.firstName || ""} ${rec.employee?.lastName || ""}`.trim() || "You";
      return [
        rec._id,
        `"${empName}"`,
        `"${rec.employee?.department || ""}"`,
        `"${formatDate(rec.date)}"`,
        `"${rec.checkIn ? formatTime(rec.checkIn) : "N/A"}"`,
        `"${rec.checkOut ? formatTime(rec.checkOut) : "N/A"}"`,
        `"${rec.status || ""}"`,
        `"${rec.notes || ""}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_records_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const leaveCount = attendance.filter((a) => a.status === "On Leave").length;

  const pageTitle = isAdmin
    ? "Company Attendance & Punctuality"
    : isCeo
    ? "Workforce Attendance & Shift Insights"
    : isHr
    ? "People Operations • Attendance & Timesheets"
    : isManager
    ? `${user?.department || "Department"} Shift & Attendance Logs`
    : "My Shift & Attendance";

  const pageSubtitle = canManageAttendance
    ? "Live arrival timestamps, departure logs, approved leaves, and punctuality tracking"
    : "Daily check-in logs, total shift duration, and personal historical records";

  return (
    <DashboardLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportAttendanceCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Export Attendance CSV"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {canMarkAttendance && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsMarkModalOpen(true)}
            >
              <span>+ Mark Attendance</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {actionSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/95 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
            <span>✓ {actionSuccess}</span>
            <button type="button" onClick={() => setActionSuccess("")} className="font-bold text-emerald-900">×</button>
          </div>
        )}

        {/* Daily Shift Punch Card (For all users to record shift) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>TODAY&apos;S SHIFT • {formatDate(new Date())}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Workday Status:{" "}
                <span className={todayRecord?.status === "Present" ? "text-emerald-700" : "text-amber-700"}>
                  {todayRecord?.status || "Not Checked In"}
                </span>
              </h3>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                {todayRecord?.checkIn && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Clock-In:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {formatTime(todayRecord.checkIn)}
                    </span>
                  </div>
                )}

                {todayRecord?.checkOut && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Clock-Out:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {formatTime(todayRecord.checkOut)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {!todayRecord?.checkIn ? (
                <Button
                  onClick={handleCheckIn}
                  loading={checkInLoading}
                  size="md"
                  className="w-full md:w-auto"
                >
                  Clock In (Start Shift)
                </Button>
              ) : !todayRecord?.checkOut ? (
                <Button
                  onClick={handleCheckOut}
                  loading={checkOutLoading}
                  variant="secondary"
                  size="lg"
                  className="w-full md:w-auto shadow-sm"
                >
                  Check Out (End Shift)
                </Button>
              ) : (
                <div className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 py-3 px-5 rounded-2xl shadow-2xs">
                  Shift Completed for Today ✓
                </div>
              )}
            </div>
          </div>

        {/* Attendance Metric Cards Strip */}
        {canManageAttendance && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Records Displayed
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {attendance.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Present
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {presentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Absent
              </p>
              <p className="mt-1 text-2xl font-black text-rose-600">
                {absentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                On Approved Leave
              </p>
              <p className="mt-1 text-2xl font-black text-amber-600">
                {leaveCount}
              </p>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600">
              Date Filter:
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600">
              Status Filter:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Attendance Log Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" message="Loading attendance records..." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    {canManageAttendance && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Shift Date</th>
                    <th className="px-6 py-4">Check-In</th>
                    <th className="px-6 py-4">Check-Out</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {attendance.map((rec) => {
                    const empName =
                      rec.employee?.fullName ||
                      `${rec.employee?.firstName || ""} ${rec.employee?.lastName || ""}`.trim() ||
                      "You";
                    return (
                      <tr key={rec._id} className="hover:bg-slate-50/60 transition">
                        {canManageAttendance && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700 text-xs">
                                {empName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{empName}</p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {rec.employee?.department || "General"}
                                </p>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-700 font-semibold">
                          {formatDate(rec.date)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-mono">
                          {rec.checkIn ? formatTime(rec.checkIn) : "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-mono">
                          {rec.checkOut ? formatTime(rec.checkOut) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                              rec.status
                            )}`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 italic">
                          {rec.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}

                  {attendance.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManageAttendance ? 6 : 5}
                        className="py-12 text-center text-xs text-slate-400"
                      >
                        No attendance records logged for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {canMarkAttendance && (
        <Modal
          isOpen={isMarkModalOpen}
          onClose={() => setIsMarkModalOpen(false)}
          title="Record Daily Attendance"
          subtitle="Manually update shift status for an employee"
        >
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={markForm.employee}
                onChange={(e) =>
                  setMarkForm((prev) => ({ ...prev, employee: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                required
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName || `${emp.firstName} ${emp.lastName}`} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Shift Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={markForm.date}
                onChange={(e) =>
                  setMarkForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={markForm.status}
                onChange={(e) =>
                  setMarkForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Notes
              </label>
              <input
                type="text"
                value={markForm.notes}
                onChange={(e) =>
                  setMarkForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional explanation (e.g. approved sick leave)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" loading={markLoading} className="px-6">
                Save Attendance Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
