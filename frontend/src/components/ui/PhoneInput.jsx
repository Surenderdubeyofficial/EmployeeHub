"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Flags from "country-flag-icons/react/3x2";

const COUNTRIES = [
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "PK", name: "Pakistan", dialCode: "+92" },
  { code: "BD", name: "Bangladesh", dialCode: "+880" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "NZ", name: "New Zealand", dialCode: "+64" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "ID", name: "Indonesia", dialCode: "+62" },
  { code: "PH", name: "Philippines", dialCode: "+63" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
];

export default function PhoneInput({
  value = "",
  country = "IN",
  onChange,
  onCountryChange,
  label = "Mobile Number",
  error,
  required = true,
  disabled = false,
  placeholder = "98765 43210",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find(
        (c) => c.code.toUpperCase() === String(country || "IN").toUpperCase()
      ) || COUNTRIES[0]
    );
  }, [country]);

  const filteredCountries = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleCountrySelect = (c) => {
    if (onCountryChange) {
      onCountryChange(c.code);
    }
    setDropdownOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e) => {
    // Strictly prevent typing '0' if the field is currently empty or selection is at index 0
    if (
      e.key === "0" &&
      (!value || value.length === 0 || (e.target.selectionStart === 0 && !e.target.selectionEnd))
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e) => {
    // Keep only digits and strictly strip any leading zeros
    const digitsOnly = e.target.value.replace(/[^\d]/g, "").replace(/^0+/, "");
    if (onChange) {
      onChange(digitsOnly);
    }
  };

  const FlagComponent = Flags[selectedCountry.code];

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex rounded-lg">
        {/* Country Selector Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-l-lg border border-r-0 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100 z-10 ${
            error ? "border-red-400" : "border-slate-300"
          }`}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-xs shrink-0 shadow-xs">
            {FlagComponent ? (
              <FlagComponent title={selectedCountry.name} />
            ) : (
              <span className="text-xs">🌐</span>
            )}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {selectedCountry.dialCode}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Digits Input */}
        <input
          type="tel"
          disabled={disabled}
          value={value}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-r-lg border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          }`}
        />

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-in fade-in duration-100">
            {/* Search Country */}
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const ItemFlag = Flags[c.code];
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-4 h-3 flex items-center justify-center overflow-hidden rounded-xs shrink-0 shadow-xs">
                          {ItemFlag ? <ItemFlag title={c.name} /> : <span>🌐</span>}
                        </span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 shrink-0 ml-2">
                        {c.dialCode}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
