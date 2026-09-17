"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TaskCard from "../../components/tasks/TaskCard";
import TaskForm from "../../components/tasks/TaskForm";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

const STATUSES = ["All", "Pending", "In Progress", "Completed", "Cancelled"];
const PRIORITIES = ["All", "Urgent", "High", "Medium", "Low"];

export default function TasksPage() {
  const { user, isAdmin, isCeo, isHr, isManager, isEmployee, loading: authLoading, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const canCreateTask = isAdmin || isCeo || isManager || isHr;

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "grid"

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTasksAndEmployees = async () => {
    try {
      setLoading(true);
      const [tasksRes, empRes] = await Promise.all([
        api.get("/api/tasks"),
        canCreateTask ? api.get("/api/employees") : Promise.resolve({ data: { employees: [] } }),
      ]);

      setTasks(tasksRes?.tasks || tasksRes?.data?.tasks || []);
      setEmployees(empRes?.employees || empRes?.data?.employees || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchTasksAndEmployees();
  }, [authLoading, isAuthenticated, canCreateTask]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleCreateTask = async (taskPayload) => {
    try {
      setCreateLoading(true);
      const res = await api.post("/api/tasks", taskPayload);
      const newTask = res?.task || res?.data?.task;
      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      alert(err.message || "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      statusFilter === "All" || t.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || t.priority === priorityFilter;
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Kanban column buckets
  const kanbanColumns = [
    {
      id: "Pending",
      title: "To Do / Backlog",
      dotColor: "bg-amber-500",
      tasks: filteredTasks.filter((t) => t.status === "Pending"),
    },
    {
      id: "In Progress",
      title: "In Progress",
      dotColor: "bg-blue-500",
      tasks: filteredTasks.filter((t) => t.status === "In Progress"),
    },
    {
      id: "Completed",
      title: "Completed",
      dotColor: "bg-emerald-500",
      tasks: filteredTasks.filter((t) => t.status === "Completed"),
    },
  ];

  const pageTitle = isAdmin
    ? "Task Management Board"
    : isCeo
    ? "Executive Strategic Deliverables"
    : isHr
    ? "Workforce Tasks & Sprints"
    : isManager
    ? `${user?.department || "Department"} Tasks & Sprints`
    : "My Assigned Tasks";

  const pageSubtitle = isAdmin || isCeo || isHr
    ? "Cross-team Kanban workflow, assignees, deadlines, and delivery milestones"
    : isManager
    ? `Active roadmap and sprint deliverables for ${user?.department || "your"} department`
    : "Workday milestones, active deliverables, and personal task board";

  return (
    <DashboardLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      action={
        canCreateTask ? (
          <Button
            size="sm"
            variant="primary"
            className="shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+ Create Task</span>
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Top Summary Metrics Strip with Progress Bar */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Deliverables</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{totalCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Progress</p>
            <p className="mt-1 text-2xl font-black text-blue-600">{inProgressCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="mt-1 text-2xl font-black text-amber-600">{pendingCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Velocity Rate</p>
              <span className="text-xs font-black text-emerald-600">{completionRate}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-slate-500">{completedCount} tasks closed</p>
          </div>
        </div>

        {/* Filter and View Mode Switcher Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
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
              placeholder="Search tasks by title, keyword, or assignee..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition"
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

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-white focus:border-blue-500 transition"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All Statuses" : st}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-white focus:border-blue-500 transition"
            >
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr === "All" ? "All Priorities" : `Priority: ${pr}`}
                </option>
              ))}
            </select>

            {/* View Switcher: Kanban vs Grid */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "kanban"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Kanban Board"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75A2.25 2.25 0 014.5 4.5z" />
                </svg>
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card Grid"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" message="Loading task workspace..." />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-slate-900">No tasks found</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {isAdmin
                ? "Click '+ Create Task' above to assign deliverables to your team."
                : "You currently have no tasks matching the selected filters."}
            </p>
          </div>
        ) : viewMode === "kanban" ? (
          /* Kanban Board View */
          <div className="grid gap-6 md:grid-cols-3">
            {kanbanColumns.map((col) => (
              <div
                key={col.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-2xs flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                      {col.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-black text-slate-700 shadow-2xs">
                    {col.tasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="space-y-4 flex-1">
                  {col.tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      canDelete={isAdmin}
                    />
                  ))}

                  {col.tasks.length === 0 && (
                    <div className="py-10 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                      No tasks in {col.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Standard Card Grid View */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                canDelete={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isAdmin && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Deliverable"
          subtitle="Assign work item to an employee with due date and priority"
        >
          <TaskForm
            employees={employees}
            onSubmit={handleCreateTask}
            loading={createLoading}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}
