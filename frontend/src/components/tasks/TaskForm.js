"use client";

import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function TaskForm({
  employees = [],
  onSubmit,
  loading = false,
  initialData = {},
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    assignedTo: initialData.assignedTo?._id || initialData.assignedTo || "",
    priority: initialData.priority || "Medium",
    dueDate: initialData.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Task title is required";
    if (!form.assignedTo) errs.assignedTo = "Please select an assigned employee";
    if (!form.dueDate) errs.dueDate = "Due date is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="e.g. Implement User Authentication"
        error={errors.title}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed task description and requirements..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Assign To <span className="text-red-500">*</span>
          </label>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 ${
              errors.assignedTo ? "border-red-400" : "border-slate-300"
            }`}
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName || `${emp.firstName} ${emp.lastName}`} (
                {emp.department})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="mt-1.5 text-xs text-red-600">{errors.assignedTo}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button type="submit" loading={loading} className="px-6">
          {initialData?._id ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
