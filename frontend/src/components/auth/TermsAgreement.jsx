"use client";

import { useState } from "react";

export default function TermsAgreement({
  checked,
  error,
  onChange,
}) {
  const [showTerms, setShowTerms] =
    useState(false);

  const [showPrivacy, setShowPrivacy] =
    useState(false);

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id="termsAccepted"
            type="checkbox"
            checked={checked}
            onChange={(event) =>
              onChange(
                event.target.checked
              )
            }
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />

          <span className="text-sm leading-6 text-gray-600">
            I confirm that the information provided
            is accurate and I agree to the{" "}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setShowTerms(true);
              }}
              className="font-medium text-blue-600 underline hover:text-blue-700"
            >
              Terms and Conditions
            </button>{" "}

            and{" "}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setShowPrivacy(true);
              }}
              className="font-medium text-blue-600 underline hover:text-blue-700"
            >
              Privacy Policy
            </button>
            .
            <span className="ml-1 text-red-500">
              *
            </span>
          </span>
        </label>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Terms and Conditions
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowTerms(false)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 max-h-80 overflow-y-auto text-sm leading-6 text-gray-600">
              <p>
                By creating an EmployeeHub account,
                you confirm that the information you
                provide is accurate and complete.
              </p>

              <p className="mt-4">
                You agree to use EmployeeHub only for
                authorized employee-management
                activities and to follow applicable
                company policies.
              </p>

              <p className="mt-4">
                Your account credentials must be kept
                secure. You are responsible for activity
                performed using your account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowTerms(false)
              }
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Privacy Policy
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPrivacy(false)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 max-h-80 overflow-y-auto text-sm leading-6 text-gray-600">
              <p>
                EmployeeHub uses the information
                provided during registration for account
                creation, authentication, employee
                management, and related platform
                functionality.
              </p>

              <p className="mt-4">
                Contact information and uploaded
                documents should only be provided when
                required for legitimate EmployeeHub
                activities.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowPrivacy(false)
              }
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
