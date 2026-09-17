"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const [query, setQuery] = useState("");

  const quickLinks = [
    { name: "Dashboard Overview", href: "/dashboard", category: "Navigation", icon: "📊" },
    { name: "Employees Directory", href: "/employees", category: "Navigation", icon: "👥", adminOnly: true },
    { name: "Add New Employee", href: "/employees/add", category: "Action", icon: "➕", adminOnly: true },
    { name: "Task Management Board", href: "/tasks", category: "Navigation", icon: "✅" },
    { name: "Attendance & Shift Tracking", href: "/attendance", category: "Navigation", icon: "📅" },
    { name: "My Personal Profile", href: "/profile", category: "Settings", icon: "👤" },
    { name: "Account & Security Settings", href: "/settings", category: "Settings", icon: "⚙️" },
  ];

  const filteredLinks = quickLinks.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (!query.trim()) return true;
    return item.name.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase());
  });

  // Handle ESC and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(true);
      }
      if (e.key === "Escape" && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => onClose(false)}
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0F172A] text-slate-100 shadow-2xl shadow-black/80">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Type a command, page, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <kbd className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  router.push(item.href);
                  onClose(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-blue-600 hover:text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-white/80">
                  {item.category}
                </span>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching pages or actions found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 px-4 py-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px]">↑</kbd>
            <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px]">↓</kbd>
            <span>to navigate</span>
            <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px]">↵</kbd>
            <span>to select</span>
          </div>
          <span className="font-semibold text-blue-400">EmployeeHub OS</span>
        </div>
      </div>
    </div>
  );
}
