"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import useAuth from "../../../hooks/useAuth";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Loader from "../../../components/ui/Loader";
import EmployeeForm from "../../../components/employees/EmployeeForm";
import { formatDate, getInitials, getStatusBadgeClass } from "../../../lib/utils";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getDocBadge = (mimeType, name) => {
  if (mimeType?.includes("pdf") || name?.toLowerCase().endsWith(".pdf")) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-[10px]">
        PDF
      </span>
    );
  }
  if (mimeType?.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(name || "")) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px]">
        IMG
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">
      DOC
    </span>
  );
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isHr, canManageEmployees, loading: authLoading, isAuthenticated } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState("");

  // Document management state
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [selectedNewDocs, setSelectedNewDocs] = useState([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docDeleteIndex, setDocDeleteIndex] = useState(null);

  const employeeId = params?.id;

  const fetchData = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const [empRes, tasksRes] = await Promise.all([
        api.get(`/api/employees/${employeeId}`),
        api.get(`/api/tasks`),
      ]);

      setEmployee(empRes?.employee || empRes?.data?.employee || null);

      const allTasks = tasksRes?.tasks || tasksRes?.data?.tasks || [];
      setTasks(
        allTasks.filter(
          (t) =>
            t.assignedTo?._id === employeeId || t.assignedTo === employeeId
        )
      );
    } catch (err) {
      setError(err.message || "Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchData();
  }, [employeeId, authLoading, isAuthenticated]);

  const handleUpdate = async (updatedData) => {
    setEditLoading(true);
    try {
      const res = await api.put(`/api/employees/${employeeId}`, updatedData);
      setEmployee(res?.employee || res?.data?.employee || employee);
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to update employee");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/api/employees/${employeeId}`);
      router.push("/employees");
    } catch (err) {
      alert(err.message || "Failed to delete employee");
    }
  };

  const handleUploadDocuments = async (e) => {
    e.preventDefault();
    if (!selectedNewDocs || selectedNewDocs.length === 0) {
      alert("Please select at least one document to upload");
      return;
    }

    const currentCount = (employee?.documents || []).length;
    if (currentCount + selectedNewDocs.length > 5) {
      alert(
        `Maximum 5 documents allowed. Employee currently has ${currentCount}. You can add up to ${
          5 - currentCount
        } more.`
      );
      return;
    }

    setDocUploading(true);
    try {
      const formData = new FormData();
      selectedNewDocs.forEach((doc) => {
        formData.append("documents", doc);
      });

      const res = await api.postForm(`/api/employees/${employeeId}/documents`, formData);
      const updated = res?.employee || res?.data?.employee;
      if (updated) {
        setEmployee(updated);
        setSelectedNewDocs([]);
        setIsUploadDocModalOpen(false);
        alert("Document(s) uploaded successfully!");
      }
    } catch (err) {
      alert(err.message || "Failed to upload document");
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDocument = async (index, docName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${docName || "this document"}" from employee record?`
      )
    ) {
      return;
    }

    setDocDeleteIndex(index);
    try {
      const res = await api.delete(`/api/employees/${employeeId}/documents/${index}`);
      const updated = res?.employee || res?.data?.employee;
      if (updated) {
        setEmployee(updated);
      }
    } catch (err) {
      alert(err.message || "Failed to delete document");
    } finally {
      setDocDeleteIndex(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Employee Details">
        <div className="flex h-96 items-center justify-center">
          <Loader size="lg" message="Loading employee profile..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !employee) {
    return (
      <DashboardLayout title="Employee Not Found">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-red-600">
            {error || "Employee record does not exist."}
          </p>
          <Link href="/employees" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              ← Back to Directory
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const name =
    employee.fullName ||
    `${employee.firstName || ""} ${employee.lastName || ""}`;

  return (
    <DashboardLayout
      title={name}
      subtitle={`Employee Profile • ${employee.department}`}
      action={
        (canManageEmployees || isAdmin) ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 overflow-hidden">
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
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                    employee.status
                  )}`}
                >
                  {employee.status || "active"}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {employee.department} • {employee.employmentType || "Full Time"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Joined: {formatDate(employee.joiningDate)} • {employee.experience || 0} years exp.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-slate-600 space-y-1">
            <p>
              <span className="text-slate-400">Email:</span>{" "}
              <span className="font-semibold text-slate-800">{employee.email}</span>
            </p>
            <p>
              <span className="text-slate-400">Phone:</span>{" "}
              <span className="font-semibold text-slate-800">{employee.phone}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Personal & Employment */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Personal & Contact Information">
              <dl className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">First Name</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {employee.firstName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Last Name</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {employee.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Email Address</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {employee.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Mobile Number</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {employee.phone} ({employee.phoneCountry || "IN"})
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-400 font-medium">Address</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {employee.address || "No address on record"}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card title="Skills & Competencies">
              {employee.skills && employee.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills listed.</p>
              )}
            </Card>

            {/* Assigned Tasks */}
            <Card
              title="Assigned Tasks"
              subtitle={`Work items assigned to ${employee.firstName}`}
            >
              <div className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{task.title}</p>
                      <p className="text-slate-500 mt-0.5">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No active tasks currently assigned.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Col: Documents */}
          <div className="space-y-6">
            <Card
              title="Uploaded Documents"
              subtitle={`${employee.documents?.length || 0} / 5 document(s)`}
              action={
                (canManageEmployees || isAdmin) && (employee.documents?.length || 0) < 5 ? (
                  <button
                    type="button"
                    onClick={() => setIsUploadDocModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    + Add Document
                  </button>
                ) : null
              }
            >
              <div className="space-y-3">
                {(employee.documents || []).map((doc, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getDocBadge(doc.mimeType, doc.name)}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {doc.name || `Document ${index + 1}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(doc.size) || "File"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.path && (
                        <a
                          href={
                            doc.path.startsWith("http")
                              ? doc.path
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${doc.path}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition shadow-2xs"
                        >
                          View ↗
                        </a>
                      )}

                      {(canManageEmployees || isAdmin) && (
                        <button
                          type="button"
                          disabled={docDeleteIndex === index}
                          onClick={() => handleDeleteDocument(index, doc.name)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 transition shadow-2xs disabled:opacity-50"
                          title="Delete document"
                        >
                          {docDeleteIndex === index ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!employee.documents || employee.documents.length === 0) && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      No documents uploaded for this employee yet.
                    </p>
                    {(canManageEmployees || isAdmin) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsUploadDocModalOpen(true)}
                      >
                        + Upload Document
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Document Modal for Admin */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => {
          setIsUploadDocModalOpen(false);
          setSelectedNewDocs([]);
        }}
        title="Upload Employee Document"
        subtitle={`Add files to ${name}'s verified records (${5 - (employee.documents?.length || 0)} slots available)`}
      >
        <form onSubmit={handleUploadDocuments} className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 transition bg-slate-50/50">
            <div className="text-2xl mb-2">📁</div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 cursor-pointer">
              <span className="text-blue-600 hover:underline">Click to browse</span> or drag files here
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const maxAllowed = 5 - (employee.documents?.length || 0);
                  if (files.length > maxAllowed) {
                    alert(`You can only select up to ${maxAllowed} file(s).`);
                    setSelectedNewDocs(files.slice(0, maxAllowed));
                  } else {
                    setSelectedNewDocs(files);
                  }
                }}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              PDF, PNG, JPG or WEBP up to 10MB each (max {5 - (employee.documents?.length || 0)} files)
            </p>
          </div>

          {selectedNewDocs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Selected Files:</p>
              {selectedNewDocs.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>📄</span>
                    <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                    <span className="text-slate-400 text-[11px]">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNewDocs((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 hover:text-red-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadDocModalOpen(false);
                setSelectedNewDocs([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={docUploading}
              disabled={selectedNewDocs.length === 0}
            >
              Upload Document(s)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        subtitle={`Update details for ${name}`}
        maxWidth="max-w-2xl"
      >
        <EmployeeForm
          initialData={employee}
          onSubmit={handleUpdate}
          loading={editLoading}
          isEdit={true}
        />
      </Modal>
    </DashboardLayout>
  );
}
