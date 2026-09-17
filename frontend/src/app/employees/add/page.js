"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import EmployeeForm from "../../../components/employees/EmployeeForm";
import Card from "../../../components/ui/Card";

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (employeeData) => {
    setLoading(true);
    setError("");

    try {
      await api.post("/api/employees", employeeData);
      router.push("/employees");
    } catch (err) {
      setError(err.message || "Failed to create employee record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Add New Employee"
      subtitle="Register a new workforce member into EmployeeHub directory"
      allowedRoles={["admin", "hr"]}
      action={
        <Link
          href="/employees"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Back to Directory
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        <Card title="Employee Profile Information" subtitle="Enter the full employment and contact details">
          <EmployeeForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
