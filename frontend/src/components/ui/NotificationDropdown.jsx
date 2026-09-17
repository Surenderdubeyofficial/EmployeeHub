"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Daily Attendance Sync",
      desc: "Attendance punch logs recorded for today with 96% punctuality.",
      time: "10m ago",
      type: "attendance",
      unread: true,
    },
    {
      id: 2,
      title: "New Task Assigned",
      desc: "API Documentation & Swagger UI assigned to Aisha Khan.",
      time: "45m ago",
      type: "task",
      unread: true,
    },
    {
      id: 3,
      title: "Security Verified",
      desc: "Google SSO & Twilio 2FA session authenticated securely.",
      time: "2h ago",
      type: "security",
      unread: true,
    },
    {
      id: 4,
      title: "Employee Directory Updated",
      desc: "Engineering team headcount successfully updated.",
      time: "Yesterday",
      type: "employee",
      unread: false,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
        aria-label="View notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
              <p className="text-[11px] text-slate-500">Live workplace activity alerts</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`py-3 flex items-start gap-3 transition rounded-lg px-2 ${
                  item.unread ? "bg-blue-50/40" : "hover:bg-slate-50"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                  {item.type === "attendance" ? "📅" : item.type === "task" ? "✅" : "🔔"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-1 border-t border-slate-100 text-center">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Activity Feed →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
