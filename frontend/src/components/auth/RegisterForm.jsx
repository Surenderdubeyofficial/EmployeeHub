"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import PersonalInformation from "./PersonalInformation";
import AccountContact from "./AccountContact";
import EmploymentInformation from "./EmploymentInformation";
import SkillsSelector from "./SkillsSelector";
import AddressInformation from "./AddressInformation";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import DocumentsUpload from "./DocumentsUpload";
import TermsAgreement from "./TermsAgreement";
import Button from "../ui/Button";
import GoogleAuthButton from "./GoogleAuthButton";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneCountry: "IN",
  password: "",
  confirmPassword: "",
  role: "employee",
  department: "",
  employmentType: "",
  joiningDate: "",
  experience: "0",
  skills: [],
  address: "",
  termsAccepted: false,
  profilePhoto: null,
  documents: [],
};

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      errs.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errs.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      errs.phone = "Mobile number is required";
    } else if (trimmedPhone.startsWith("0")) {
      errs.phone = "Mobile number cannot start with 0 as country code is already selected";
    } else if (trimmedPhone.length < 7) {
      errs.phone = "Enter a valid mobile phone number";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (
      formData.password.length < 8 ||
      !/[a-zA-Z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      errs.password =
        "Password must be at least 8 characters with at least one letter and one number";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!formData.department) {
      errs.department = "Please select a department";
    }

    if (!formData.employmentType) {
      errs.employmentType = "Please select an employment type";
    }

    if (!formData.joiningDate) {
      errs.joiningDate = "Joining date is required";
    }

    if (!formData.skills || formData.skills.length === 0) {
      errs.skills = "Please add at least one skill";
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = "You must accept the Terms and Privacy Policy";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName.trim());
      data.append("lastName", formData.lastName.trim());
      data.append("email", formData.email.trim().toLowerCase());
      data.append("phone", formData.phone.trim());
      data.append("phoneCountry", formData.phoneCountry || "IN");
      data.append("password", formData.password);
      data.append("role", formData.role || "employee");
      data.append("department", formData.department);
      data.append("employmentType", formData.employmentType);
      data.append("joiningDate", formData.joiningDate);
      data.append("experience", String(formData.experience || 0));
      data.append("skills", JSON.stringify(formData.skills));
      data.append("address", formData.address.trim());
      data.append("termsAccepted", "true");

      if (formData.profilePhoto) {
        data.append("profilePhoto", formData.profilePhoto);
      }

      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((doc) => {
          data.append("documents", doc);
        });
      }

      const res = await api.postForm("/api/auth/register", data);

      if (res?.success) {
        const registeredEmail =
          res?.user?.email || formData.email.trim().toLowerCase();
        const registeredPhone =
          res?.user?.phone || formData.phone.trim();
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            registeredEmail
          )}&phone=${encodeURIComponent(registeredPhone)}`
        );
      }
    } catch (err) {
      setGeneralError(
        err.message || "Registration failed. Please check the form and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {generalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <span className="text-red-500 font-bold shrink-0">⚠️</span>
          <p>{generalError}</p>
        </div>
      )}

      {/* 00 Fast-Track Google Onboarding */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center shadow-xs">
        <h3 className="text-sm font-bold text-slate-800">
          Fast-Track Google Registration
        </h3>
        <p className="mt-1 text-xs text-slate-500 mb-4">
          Instant employee account creation with your verified Google profile
        </p>
        <GoogleAuthButton
          mode="signup"
          onError={(msg) => setGeneralError(msg)}
        />
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-slate-200"></div>
        <span className="absolute bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Or complete full registration form below
        </span>
      </div>

      {/* 01 Personal Information */}
      <PersonalInformation
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      {/* 02 Account & Contact */}
      <AccountContact
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      {/* 03 Employment Information */}
      <EmploymentInformation
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      {/* 04 Skills Selector */}
      <SkillsSelector
        value={formData.skills}
        onChange={(skills) => updateField("skills", skills)}
        error={errors.skills}
      />

      {/* 05 Address Information */}
      <AddressInformation
        formData={formData}
        errors={errors}
        updateField={updateField}
      />

      {/* 06 Profile Photo */}
      <ProfilePhotoUpload
        file={formData.profilePhoto}
        error={errors.profilePhoto}
        onChange={(file) => updateField("profilePhoto", file)}
      />

      {/* 07 Documents Upload */}
      <DocumentsUpload
        files={formData.documents}
        error={errors.documents}
        onChange={(files) => updateField("documents", files)}
      />

      {/* 08 Terms Agreement */}
      <TermsAgreement
        checked={formData.termsAccepted}
        error={errors.termsAccepted}
        onChange={(checked) => updateField("termsAccepted", checked)}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full text-base py-3.5 shadow-md"
        >
          Create Employee Account
        </Button>

        <p className="mt-4 text-center text-xs text-slate-500">
          After registration, you will verify your email and mobile number with OTP.
        </p>
      </div>
    </form>
  );
}
