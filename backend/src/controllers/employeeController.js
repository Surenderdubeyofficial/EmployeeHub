import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { normalizePhoneNumber, isAllowedDuplicatePhone } from "../services/smsService.js";

const allowedProfileFields = [
  "firstName",
  "lastName",
  "phone",
  "phoneCountry",
  "department",
  "employmentType",
  "joiningDate",
  "experience",
  "skills",
  "address",
];

export const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status, employmentType, role } = req.query;

  const filter = {};

  if (role) filter.role = role;
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (employmentType) filter.employmentType = employmentType;

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const employees = await User.find(filter).sort({ createdAt: -1 });

  return sendSuccess(res, "Employees fetched successfully", { employees });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Employee fetched successfully", { employee });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const rawPhone = String(req.body.phone || "").trim();
  if (rawPhone.startsWith("0")) {
    const error = new Error("Mobile number cannot start with 0 as country code is already selected");
    error.statusCode = 400;
    throw error;
  }

  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const normalizedPhone = normalizePhoneNumber(rawPhone, req.body.phoneCountry || "IN");
  if (!isAllowedDuplicatePhone(rawPhone)) {
    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      const error = new Error("Mobile number is already registered");
      error.statusCode = 409;
      throw error;
    }
  }

  const role = req.body.role && ["admin", "ceo", "hr", "manager", "employee"].includes(req.body.role)
    ? req.body.role
    : "employee";

  const employee = await User.create({
    ...req.body,
    phone: normalizedPhone,
    role,
    termsAccepted: true,
    isVerified: true,
    mobileVerified: true,
  });

  return sendSuccess(res, "Employee created successfully", { employee }, 201);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.phone !== undefined) {
    const rawPhone = String(req.body.phone).trim();
    if (rawPhone.startsWith("0")) {
      const error = new Error("Mobile number cannot start with 0 as country code is already selected");
      error.statusCode = 400;
      throw error;
    }
    const normalizedPhone = normalizePhoneNumber(rawPhone, req.body.phoneCountry || "IN");
    if (!isAllowedDuplicatePhone(rawPhone)) {
      const existingPhone = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: req.params.id },
      });
      if (existingPhone) {
        const error = new Error("Mobile number is already registered to another employee");
        error.statusCode = 409;
        throw error;
      }
    }
    updates.phone = normalizedPhone;
  }

  allowedProfileFields.forEach((field) => {
    if (field !== "phone" && req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (req.body.role && ["admin", "ceo", "hr", "manager", "employee"].includes(req.body.role)) {
    updates.role = req.body.role;
  }

  const employee = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Employee updated successfully", { employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findByIdAndDelete(req.params.id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Employee deleted successfully");
});

export const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["active", "inactive", "on-leave"].includes(status)) {
    const error = new Error("Invalid employee status");
    error.statusCode = 400;
    throw error;
  }

  const employee = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Employee status updated successfully", { employee });
});

export const updateEmployeeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["admin", "ceo", "hr", "manager", "employee"].includes(role)) {
    const error = new Error("Invalid role specified. Must be 'admin', 'ceo', 'hr', 'manager', or 'employee'");
    error.statusCode = 400;
    throw error;
  }

  if (req.user._id.toString() === req.params.id && role !== "admin") {
    const error = new Error("Administrators cannot revoke their own admin status");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error("User record not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, `User role updated to ${role} successfully`, { user });
});

const buildFileInfo = (file) => {
  if (!file) return undefined;
  return {
    name: file.originalname,
    path: file.path.replace(/\\/g, "/"),
    mimeType: file.mimetype,
    size: file.size,
  };
};

export const uploadEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  const newFiles = req.files?.documents || (req.file ? [req.file] : []);
  if (!newFiles || newFiles.length === 0) {
    const error = new Error("Please select at least one document to upload");
    error.statusCode = 400;
    throw error;
  }

  const newDocs = newFiles.map(buildFileInfo);
  const combined = [...(employee.documents || []), ...newDocs];

  if (combined.length > 5) {
    const error = new Error("Maximum 5 documents can be stored per employee.");
    error.statusCode = 400;
    throw error;
  }

  employee.documents = combined;
  await employee.save();

  return sendSuccess(res, "Document(s) uploaded successfully", { employee });
});

export const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  const { index } = req.params;
  const docIdx = parseInt(index, 10);

  if (isNaN(docIdx) || docIdx < 0 || docIdx >= (employee.documents || []).length) {
    const error = new Error("Invalid document index specified");
    error.statusCode = 400;
    throw error;
  }

  employee.documents.splice(docIdx, 1);
  await employee.save();

  return sendSuccess(res, "Document deleted successfully", { employee });
});

