"use client";

import React from "react";
import Link from "next/link";
import { getInitials, getStatusBadgeClass } from "../../lib/utils";

export default function EmployeeCard({ employee }) {
  if (!employee) return null;

  const name =
    employee.fullName ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Employee";

  return (
    <div className="group rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top: Avatar & Status Badge */}
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white text-base shadow-sm overflow-hidden group-hover:scale-105 transition">
            {employee.profilePhoto?.path ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={
                  employee.profilePhoto.path.startsWith("http")
                    ? employee.profilePhoto.path
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${employee.profilePhoto.path}`
                }
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(name)
            )}
          </div>

          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold capitalize ${getStatusBadgeClass(
              employee.status
            )}`}
          >
            {employee.status || "active"}
          </span>
        </div>

        {/* Info */}
        <div className="mt-4">
          <h4 className="font-bold text-base text-slate-900 truncate group-hover:text-blue-600 transition">
            {name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              {employee.department || "General"}
            </span>
            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {employee.role || "Employee"}
            </span>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p className="truncate flex items-center gap-1.5">
              <span className="text-slate-400">✉</span> {employee.email}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-slate-400">📞</span> {employee.phone || "No phone"}
            </p>
          </div>
        </div>

        {/* Skill tags */}
        {employee.skills && employee.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {employee.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
              >
                {skill}
              </span>
            ))}
            {employee.skills.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                +{employee.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3">
        <Link
          href={`/employees/${employee._id}`}
          className="block w-full text-center rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-2xs transition"
        >
          View Full Profile →
        </Link>
      </div>
    </div>
  );
}
