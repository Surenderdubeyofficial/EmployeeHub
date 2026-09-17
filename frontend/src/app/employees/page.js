"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmployeeTable from "../../components/employees/EmployeeTable";
import EmployeeCard from "../../components/employees/EmployeeCard";
import Button from "../../components/ui/Button";

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Product",
  "Legal",
  "Customer Support",
  "IT & Infrastructure",
];

const STATUSES = ["All", "active", "on-leave", "inactive"];

export default function EmployeesPage() {
  const { isAdmin, isHr, canManageEmployees, loading: authLoading, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (department !== "All") params.append("department", department);
      if (status !== "All") params.append("status", status);

      const res = await api.get(`/api/employees?${params.toString()}`);
      setEmployees(res?.employees || res?.data?.employees || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, status, authLoading, isAuthenticated]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee record?")) return;
    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete employee");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/employees/${id}/status`, { status: newStatus });
      setEmployees((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/api/employees/${id}/role`, { role: newRole });
      setEmployees((prev) =>
        prev.map((e) => (e._id === id ? { ...e, role: newRole } : e))
      );
    } catch (err) {
      alert(err.message || "Failed to update role");
    }
  };

  // Export CSV generator
  const handleExportCSV = () => {
    if (!employees || employees.length === 0) {
      alert("No employees available to export.");
      return;
    }

    const headers = ["ID", "Full Name", "Email", "Phone", "Department", "Employment Type", "Status", "Joining Date"];
    const rows = employees.map((emp) => [
      emp._id,
      `"${emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()}"`,
      `"${emp.email || ""}"`,
      `"${emp.phone || ""}"`,
      `"${emp.department || ""}"`,
      `"${emp.employmentType || ""}"`,
      `"${emp.status || ""}"`,
      `"${emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employeehub_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e.status === "active").length;
  const onLeaveStaff = employees.filter((e) => e.status === "on-leave").length;
  const departmentsCount = new Set(employees.map((e) => e.department).filter(Boolean)).size;

  return (
    <DashboardLayout
      title="Employee Directory"
      subtitle="Comprehensive personnel records, departments, roles, and profiles"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Export CSV"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {(canManageEmployees || isAdmin) && (
            <Link href="/employees/add">
              <Button size="sm" variant="primary">
                <span>+ Add Employee</span>
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Personnel</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalStaff}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Staff</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeStaff}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">On Leave</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{onLeaveStaff}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Departments</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{departmentsCount}</p>
          </div>
        </div>

        {/* Filters and View Switcher Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, work email, or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none hover:bg-white focus:border-blue-500 focus:bg-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filters & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-white focus:border-blue-500 transition"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-white focus:border-blue-500 transition"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All Statuses" : st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Grid Cards View"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Directory Content: Table vs Grid Cards */}
        {viewMode === "table" ? (
          <EmployeeTable
            employees={employees}
            loading={loading}
            onDelete={isAdmin ? handleDelete : null}
            onStatusChange={(canManageEmployees || isAdmin) ? handleStatusChange : null}
            onRoleChange={isAdmin ? handleRoleChange : null}
          />
        ) : (
          <div>
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Loading cards...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <p className="text-base font-bold text-slate-800">No employees match this filter</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the search or filters.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((emp) => (
                  <EmployeeCard key={emp._id} employee={emp} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
