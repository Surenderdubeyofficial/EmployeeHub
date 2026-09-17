"use client";

import React from "react";
import Link from "next/link";
import { formatDate, getInitials, getStatusBadgeClass } from "../../lib/utils";

export default function EmployeeTable({
  employees = [],
  loading = false,
  onDelete,
  onStatusChange,
  onRoleChange,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
        <p className="mt-3 text-sm font-semibold text-slate-500">Loading directory records...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          No employees found
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Try adjusting your search query, department filter, or add a new team member.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {employees.map((emp) => {
              const name =
                emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`;
              return (
                <tr key={emp._id} className="hover:bg-slate-50/60 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white overflow-hidden">
                        {emp.profilePhoto?.path ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={
                              emp.profilePhoto.path.startsWith("http")
                                ? emp.profilePhoto.path
                                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${emp.profilePhoto.path}`
                            }
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/employees/${emp._id}`}
                          className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate block text-sm"
                        >
                          {name}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {onRoleChange ? (
                      <select
                        value={emp.role || "employee"}
                        onChange={(e) => onRoleChange(emp._id, e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wider outline-none hover:bg-slate-50 focus:border-blue-500 text-slate-800"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="ceo">CEO</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                          emp.role === "admin"
                            ? "bg-slate-900 text-white"
                            : emp.role === "ceo"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : emp.role === "hr"
                            ? "bg-pink-50 text-pink-700 border border-pink-200"
                            : emp.role === "manager"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {emp.role || "employee"}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {emp.department}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                    {emp.employmentType || "Full Time"}
                  </td>

                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {formatDate(emp.joiningDate)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                        emp.status
                      )}`}
                    >
                      {emp.status || "active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/employees/${emp._id}`}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
                        title="View Profile"
                      >
                        Profile
                      </Link>

                      {onStatusChange && (
                        <select
                          value={emp.status || "active"}
                          onChange={(e) =>
                            onStatusChange(emp._id, e.target.value)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="on-leave">On Leave</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(emp._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Employee"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
