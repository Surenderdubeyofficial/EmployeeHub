"use client";

import React from "react";

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function DocumentsUpload({
  files = [],
  error,
  onChange,
}) {
  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      alert("You can upload a maximum of 5 documents.");
      event.target.value = "";
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert("Documents must be PDF, JPG, PNG, or WEBP.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_SIZE) {
        alert(`${file.name} exceeds the 5 MB limit.`);
        event.target.value = "";
        return;
      }
    }

    onChange([...files, ...selectedFiles]);
    event.target.value = "";
  };

  const removeFile = (index) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          07
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload supporting documents (Certificates, Resume, ID proof).
          </p>
        </div>
      </div>

      <input
        id="documents"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />

      <p className="mt-2 text-xs text-slate-500">
        PDF, JPG, PNG or WEBP · Maximum 5 files · Maximum 5 MB each
      </p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="text-slate-400">📄</span>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 ml-4 shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
