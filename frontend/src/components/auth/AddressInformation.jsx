"use client";

import React from "react";

export default function AddressInformation({
  formData,
  errors,
  updateField,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          05
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Address & Location
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your residential or communication address.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Full Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={formData.address || ""}
          placeholder="Street address, apartment, city, state, postal code"
          onChange={(e) => updateField("address", e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            errors.address
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          }`}
        />
        {errors.address && (
          <p className="mt-2 text-sm text-red-600">{errors.address}</p>
        )}
      </div>
    </section>
  );
}
