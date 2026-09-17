"use client";

import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "IT",
  "Other",
];

const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Intern", "Contract"];

const ROLES = [
  { value: "employee", label: "Employee (Individual Contributor)" },
  { value: "manager", label: "Manager (Department Lead)" },
  { value: "hr", label: "Human Resources (HR)" },
  { value: "ceo", label: "CEO / Executive" },
  { value: "admin", label: "System Administrator" },
];

export default function EmployeeForm({
  initialData = {},
  onSubmit,
  loading = false,
  isEdit = false,
}) {
  const [form, setForm] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    phoneCountry: initialData.phoneCountry || "IN",
    password: "",
    role: initialData.role || "employee",
    department: initialData.department || "Engineering",
    employmentType: initialData.employmentType || "Full Time",
    joiningDate: initialData.joiningDate
      ? new Date(initialData.joiningDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    experience: initialData.experience || 0,
    skills: initialData.skills ? initialData.skills.join(", ") : "",
    address: initialData.address || "",
    status: initialData.status || "active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const clean = value.replace(/[^\d+]/g, "").replace(/^0+/, "");
      setForm((prev) => ({ ...prev, [name]: clean }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (form.phone.trim().startsWith("0")) {
      errs.phone = "Phone number cannot start with 0";
    }

    if (!isEdit && !form.password) {
      errs.password = "Initial password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Email Address"
          name="email"
          type="email"
          disabled={isEdit}
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Mobile Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
      </div>

      {!isEdit && (
        <div>
          <Input
            label="Initial Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 characters, letters and numbers"
            error={errors.password}
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Role / Access Level <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={form.joiningDate}
          onChange={handleChange}
        />
        <Input
          label="Years of Experience"
          name="experience"
          type="number"
          min="0"
          value={form.experience}
          onChange={handleChange}
        />
      </div>

      <div>
        <Input
          label="Skills (comma-separated)"
          name="skills"
          value={form.skills}
          placeholder="e.g. React, Node.js, SQL, Design"
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Address
        </label>
        <textarea
          name="address"
          rows={2}
          value={form.address}
          onChange={handleChange}
          placeholder="Street address, city, state"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" loading={loading} className="px-6">
          {isEdit ? "Update Employee" : "Create Employee Record"}
        </Button>
      </div>
    </form>
  );
}
