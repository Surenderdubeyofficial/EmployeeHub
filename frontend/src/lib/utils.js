/**
 * Utility functions for EmployeeHub
 */

export const formatDate = (dateInput) => {
  if (!dateInput) return "—";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
};

export const formatTime = (dateInput) => {
  if (!dateInput) return "—";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-800 border border-red-200";
    case "High":
      return "bg-rose-100 text-rose-800 border border-rose-200";
    case "Medium":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "Low":
    default:
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Completed":
    case "Active":
    case "Present":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "In Progress":
    case "Pending":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "On Leave":
    case "on-leave":
    case "Late":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "Cancelled":
    case "Inactive":
    case "inactive":
    case "Absent":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

export const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
