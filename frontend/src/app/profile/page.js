"use client";

import React, { useEffect, useState, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { formatDate, getInitials, getStatusBadgeClass } from "../../lib/utils";

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

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    skills: "",
  });

  // Profile photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Document upload state
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [selectedNewDocs, setSelectedNewDocs] = useState([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docDeleteIndex, setDocDeleteIndex] = useState(null);

  // Edit modal documents state
  const [editNewDocs, setEditNewDocs] = useState([]);
  const [docsToRemove, setDocsToRemove] = useState([]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/auth/me");
      const userObj = res?.user || res?.data?.user;
      if (userObj) {
        setProfile(userObj);
        updateUser(userObj);
        setEditForm({
          firstName: userObj.firstName || "",
          lastName: userObj.lastName || "",
          phone: userObj.phone || "",
          address: userObj.address || "",
          skills: (userObj.skills || []).join(", "),
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchProfile();
  }, [authLoading, isAuthenticated]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must be less than 5MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    if (!isEditOpen) {
      setIsEditOpen(true);
    }
  };

  // Full profile update handler (photo + text fields + document changes)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const data = new FormData();
      data.append("firstName", editForm.firstName.trim());
      data.append("lastName", editForm.lastName.trim());
      data.append("phone", editForm.phone.trim());
      data.append("address", editForm.address.trim());
      data.append(
        "skills",
        JSON.stringify(
          editForm.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );

      if (photoFile) {
        data.append("profilePhoto", photoFile);
      }

      if (docsToRemove.length > 0) {
        data.append("removedDocumentIndexes", JSON.stringify(docsToRemove));
      }

      if (editNewDocs.length > 0) {
        editNewDocs.forEach((doc) => {
          data.append("documents", doc);
        });
      }

      const res = await api.putForm("/api/auth/profile", data);
      const updated = res?.user || res?.data?.user;
      if (updated) {
        setProfile(updated);
        updateUser(updated);
        setIsEditOpen(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setEditNewDocs([]);
        setDocsToRemove([]);
        alert("Profile and documents updated successfully!");
      }
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  // Standalone document upload handler
  const handleUploadDocuments = async (e) => {
    e.preventDefault();
    if (!selectedNewDocs || selectedNewDocs.length === 0) {
      alert("Please select at least one document to upload");
      return;
    }

    const currentCount = (profile?.documents || []).length;
    if (currentCount + selectedNewDocs.length > 5) {
      alert(
        `Maximum 5 documents allowed. You currently have ${currentCount}. You can add up to ${
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

      const res = await api.postForm("/api/auth/profile/documents", formData);
      const updated = res?.user || res?.data?.user;
      if (updated) {
        setProfile(updated);
        updateUser(updated);
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

  // Document deletion handler
  const handleDeleteDocument = async (index, docName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${docName || "this document"}" from your profile?`
      )
    ) {
      return;
    }

    setDocDeleteIndex(index);
    try {
      const res = await api.delete(`/api/auth/profile/documents/${index}`);
      const updated = res?.user || res?.data?.user;
      if (updated) {
        setProfile(updated);
        updateUser(updated);
      }
    } catch (err) {
      alert(err.message || "Failed to delete document");
    } finally {
      setDocDeleteIndex(null);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex h-96 items-center justify-center">
          <Loader size="lg" message="Loading your profile..." />
        </div>
      </DashboardLayout>
    );
  }

  const name =
    profile?.fullName ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    "User";

  const currentDocs = profile?.documents || [];

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="View and manage your personal details, profile photo, and verified documents"
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsUploadDocModalOpen(true)}
          >
            <span>+ Upload Document</span>
          </Button>
          <Button size="sm" onClick={() => setIsEditOpen(true)}>
            Edit Profile
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 overflow-hidden border-2 border-slate-200 shadow-xs">
              {photoPreview || profile?.profilePhoto?.path ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    photoPreview ||
                    (profile.profilePhoto.path.startsWith("http")
                      ? profile.profilePhoto.path
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profilePhoto.path}`)
                  }
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(name)
              )}

              {/* Hover overlay with camera icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                title="Change Photo"
              >
                <span>📷</span>
                <span className="text-[10px] font-medium">Edit</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                    profile?.status
                  )}`}
                >
                  {profile?.status || "active"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile?.role === "admin" ? "Administrator" : "Employee"} •{" "}
                {profile?.department || "General"} Department
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>📷</span> Change profile photo
              </button>
              <p className="text-xs text-slate-500 mt-1">
                Joined: {formatDate(profile?.joiningDate)} •{" "}
                {profile?.experience || 0} years experience
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1 self-start sm:self-auto">
            <p>
              <span className="text-slate-400">Account Role:</span>{" "}
              <span className="font-bold text-slate-800 uppercase">
                {profile?.role}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Email Verification:</span>{" "}
              <span className="font-bold text-emerald-600">
                {profile?.isVerified ? "Verified ✓" : "Pending"}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Mobile Verification:</span>{" "}
              <span className="font-bold text-emerald-600">
                {profile?.mobileVerified ? "Verified ✓" : "Pending"}
              </span>
            </p>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Personal & Contact Details">
              <dl className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">First Name</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {profile?.firstName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Last Name</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {profile?.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Work Email</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {profile?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Phone Number</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {profile?.phone} ({profile?.phoneCountry || "IN"})
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-400 font-medium">Residential Address</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {profile?.address || "No address provided"}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card title="Professional Skills">
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </Card>
          </div>

          {/* Right Column: Uploaded Documents */}
          <div className="space-y-6">
            <Card
              title="My Uploaded Documents"
              subtitle={`${currentDocs.length} / 5 document(s)`}
              action={
                currentDocs.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setIsUploadDocModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    + Add New
                  </button>
                )
              }
            >
              <div className="space-y-3">
                {currentDocs.map((doc, index) => (
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

                      <button
                        type="button"
                        disabled={docDeleteIndex === index}
                        onClick={() => handleDeleteDocument(index, doc.name)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 transition shadow-2xs disabled:opacity-50"
                        title="Delete document"
                      >
                        {docDeleteIndex === index ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}

                {currentDocs.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      No documents on record yet.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsUploadDocModalOpen(true)}
                    >
                      + Upload Resume or Certificate
                    </Button>
                  </div>
                )}

                {currentDocs.length > 0 && currentDocs.length < 5 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setIsUploadDocModalOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      + Add another document ({5 - currentDocs.length} remaining)
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Standalone Upload Documents Modal */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => {
          setIsUploadDocModalOpen(false);
          setSelectedNewDocs([]);
        }}
        title="Upload Documents"
        subtitle={`Add identity proofs, resumes, or certificates (${5 - currentDocs.length} slots available)`}
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
                  const maxAllowed = 5 - currentDocs.length;
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
              PDF, PNG, JPG or WEBP up to 10MB each (max {5 - currentDocs.length} files)
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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditNewDocs([]);
          setDocsToRemove([]);
        }}
        title="Edit Profile"
        subtitle="Update personal details, skills, photo, and documents"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Photo upload section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 overflow-hidden border border-slate-300">
              {photoPreview || profile?.profilePhoto?.path ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    photoPreview ||
                    (profile.profilePhoto.path.startsWith("http")
                      ? profile.profilePhoto.path
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profilePhoto.path}`)
                  }
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(name)
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Profile Photo
              </label>
              <input
                type="file"
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              required
            />
            <Input
              label="Last Name"
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Input
              label="Mobile Number"
              value={editForm.phone}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d+]/g, "").replace(/^0+/, "");
                setEditForm((prev) => ({ ...prev, phone: clean }));
              }}
              onKeyDown={(e) => {
                if (e.key === "0" && !editForm.phone) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>

          <div>
            <Input
              label="Skills (comma-separated)"
              value={editForm.skills}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, skills: e.target.value }))
              }
              placeholder="React, Node.js, Design"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Address
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          {/* Document Management Section inside Edit Modal */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Documents on Record ({currentDocs.length - docsToRemove.length + editNewDocs.length} / 5)
              </label>
              <span className="text-[11px] text-slate-400">PDF, Images</span>
            </div>

            {/* Existing documents with remove toggle */}
            {currentDocs.length > 0 && (
              <div className="space-y-1.5">
                {currentDocs.map((doc, idx) => {
                  const isMarkedForRemoval = docsToRemove.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-lg border p-2 text-xs transition ${
                        isMarkedForRemoval
                          ? "border-red-200 bg-red-50/60 line-through text-red-600"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      <span className="truncate">{doc.name || `Document ${idx + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (isMarkedForRemoval) {
                            setDocsToRemove((prev) => prev.filter((i) => i !== idx));
                          } else {
                            setDocsToRemove((prev) => [...prev, idx]);
                          }
                        }}
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          isMarkedForRemoval
                            ? "bg-slate-200 text-slate-700 no-underline"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        {isMarkedForRemoval ? "Undo" : "Remove ✕"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Attach new documents */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Attach New Documents:
              </label>
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const maxAllowed = 5 - (currentDocs.length - docsToRemove.length);
                  if (files.length > maxAllowed) {
                    alert(`You can only attach up to ${maxAllowed} file(s).`);
                    setEditNewDocs(files.slice(0, maxAllowed));
                  } else {
                    setEditNewDocs(files);
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
              />
              {editNewDocs.length > 0 && (
                <p className="mt-1 text-[11px] text-blue-600 font-semibold">
                  ✓ {editNewDocs.length} new file(s) selected to upload
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditNewDocs([]);
                setDocsToRemove([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={editLoading} className="px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
