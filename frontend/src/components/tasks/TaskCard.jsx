"use client";

import React from "react";
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from "../../lib/utils";

export default function TaskCard({
  task,
  onStatusChange,
  onDelete,
  canDelete = false,
}) {
  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Completed";

  const assigneeName =
    task.assignedTo?.fullName ||
    `${task.assignedTo?.firstName || ""} ${task.assignedTo?.lastName || ""}`.trim() ||
    "Unassigned";

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold ${getPriorityBadgeClass(
              task.priority
            )}`}
          >
            {task.priority || "Medium"}
          </span>

          <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeClass(
              task.status
            )}`}
          >
            {task.status || "Pending"}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
          {task.title}
        </h4>
        {task.description && (
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Assignee & Due Date Box */}
        <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
          {task.assignedTo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Assignee</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-700 font-black">
                  {assigneeName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[130px]">{assigneeName}</span>
              </div>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Due Date</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isOverdue ? "text-rose-600 font-bold" : "text-slate-700"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
                </svg>
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && <span className="text-[10px] uppercase font-bold text-rose-600 ml-0.5">(Overdue)</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Status</span>
          <select
            value={task.status || "Pending"}
            onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500 shadow-2xs"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
            title="Delete task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
