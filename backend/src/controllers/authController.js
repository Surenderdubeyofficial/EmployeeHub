import crypto from "crypto";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { generateOtp, getOtpExpiry } from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import { sendEmailOtp, sendPasswordResetEmail } from "../services/emailService.js";
import {
  sendMobileOtp,
  checkMobileVerification,
  normalizePhoneNumber,
  isAllowedDuplicatePhone,
} from "../services/smsService.js";
import {
  verifyGoogleToken,
  verifyGoogleAccessToken,
} from "../services/googleAuthService.js";

const parseSkills = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) {
      return parsed.map((skill) => String(skill).trim()).filter(Boolean);
    }
  } catch {
    return String(skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const buildFileInfo = (file) => {
  if (!file) return undefined;

  return {
    name: file.originalname,
    path: file.path ? file.path.replace(/\\/g, "/") : "",
    mimeType: file.mimetype,
    size: file.size,
  };
};

const createVerificationOtps = () => {
  return {
    emailOtp: generateOtp(),
    emailOtpExpiresAt: getOtpExpiry(10),
    mobileOtp: generateOtp(),
    mobileOtpExpiresAt: getOtpExpiry(10),
  };
};

export const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    phoneCountry,
    password,
    role,
    department,
    employmentType,
    joiningDate,
    experience,
    address,
    termsAccepted,
  } = req.body;

  if (String(termsAccepted) !== "true") {
    const error = new Error("Terms and Privacy Policy must be accepted");
    error.statusCode = 400;
    throw error;
  }

  const rawPhone = String(phone || "").trim();
  if (rawPhone.startsWith("0")) {
    const error = new Error("Mobile number cannot start with 0 as country code is already selected");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = normalizePhoneNumber(phone, phoneCountry || "IN");

  const existingEmailUser = await User.findOne({ email: normalizedEmail });
  if (existingEmailUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  if (!isAllowedDuplicatePhone(rawPhone)) {
    const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
    if (existingPhoneUser) {
      const error = new Error("Mobile number is already registered");
      error.statusCode = 409;
      throw error;
    }
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "admin@employeehub.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminEmail = adminEmails.includes(normalizedEmail);

  let assignedRole = "employee";
  if (isAdminEmail) {
    assignedRole = "admin";
  } else if (role && ["employee", "manager", "hr", "ceo"].includes(String(role).toLowerCase())) {
    assignedRole = String(role).toLowerCase();
  }

  const otps = createVerificationOtps();

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    phone: normalizedPhone,
    phoneCountry: phoneCountry || "IN",
    password,
    department,
    employmentType,
    joiningDate,
    experience: Number(experience || 0),
    skills: parseSkills(req.body.skills),
    address,
    termsAccepted: true,
    role: assignedRole,
    profilePhoto: buildFileInfo(req.files?.profilePhoto?.[0]),
    documents: (req.files?.documents || []).map(buildFileInfo),
    ...otps,
  });

  await Promise.allSettled([
    sendEmailOtp({ to: user.email, otp: otps.emailOtp }),
    sendMobileOtp({
      to: user.phone,
      otp: otps.mobileOtp,
      countryCode: user.phoneCountry,
    }),
  ]);

  return sendSuccess(
    res,
    "Registration successful. Verification codes have been dispatched to your email and mobile phone.",
    { user: user.toJSON() },
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: String(email || "").trim().toLowerCase(),
  }).select("+password");

  if (!user || !(await user.comparePassword(password || ""))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "inactive") {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isVerified || !user.mobileVerified) {
    // Generate fresh OTPs and re-dispatch them so user is never locked out
    const otps = createVerificationOtps();
    user.emailOtp = otps.emailOtp;
    user.emailOtpExpiresAt = otps.emailOtpExpiresAt;
    user.mobileOtp = otps.mobileOtp;
    user.mobileOtpExpiresAt = otps.mobileOtpExpiresAt;
    await user.save();

    await Promise.allSettled([
      sendEmailOtp({ to: user.email, otp: otps.emailOtp }),
      sendMobileOtp({
        to: user.phone,
        otp: otps.mobileOtp,
        countryCode: user.phoneCountry || "IN",
      }),
    ]);

    return sendSuccess(
      res,
      "Account verification is required before dashboard access. Fresh verification codes have been sent to your email and phone.",
      {
        requiresVerification: true,
        user: user.toJSON(),
      }
    );
  }

  const token = generateToken(user);

  return sendSuccess(res, "Login successful", {
    token,
    user: user.toJSON(),
  });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email: String(email || "").trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpiresAt");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.emailOtp || user.emailOtp !== String(otp).trim()) {
    const error = new Error("Invalid email OTP");
    error.statusCode = 400;
    throw error;
  }

  if (user.emailOtpExpiresAt < new Date()) {
    const error = new Error("Email OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpiresAt = undefined;
  await user.save();

  const isFullyVerified = Boolean(user.isVerified && user.mobileVerified);
  const token = isFullyVerified ? generateToken(user) : null;

  return sendSuccess(res, "Email verified successfully", {
    user: user.toJSON(),
    isFullyVerified,
    token,
  });
});

export const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { phone, otp, countryCode, email } = req.body;

  const formattedPhone = normalizePhoneNumber(phone, countryCode || "IN");

  let user;
  if (email) {
    user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+mobileOtp +mobileOtpExpiresAt");
  } else {
    user = await User.findOne({
      $or: [
        { phone: String(phone || "").trim() },
        { phone: formattedPhone },
      ],
    }).select("+mobileOtp +mobileOtpExpiresAt");
  }

  if (!user) {
    const error = new Error("User not found for provided details");
    error.statusCode = 404;
    throw error;
  }

  if (user.mobileOtpExpiresAt && user.mobileOtpExpiresAt < new Date()) {
    const error = new Error("Mobile OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  const check = await checkMobileVerification({
    to: user.phone,
    otp,
    userOtp: user.mobileOtp,
    countryCode: user.phoneCountry || countryCode || "IN",
  });

  if (!check.success) {
    const error = new Error(check.message || "Invalid mobile OTP");
    error.statusCode = 400;
    throw error;
  }

  user.mobileVerified = true;
  user.mobileOtp = undefined;
  user.mobileOtpExpiresAt = undefined;
  await user.save();

  const isFullyVerified = Boolean(user.isVerified && user.mobileVerified);
  const token = isFullyVerified ? generateToken(user) : null;

  return sendSuccess(res, "Mobile number verified successfully", {
    user: user.toJSON(),
    isFullyVerified,
    token,
  });
});

export const resendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: String(email || "").trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpiresAt");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    return sendSuccess(res, "Email is already verified", { user: user.toJSON() });
  }

  user.emailOtp = generateOtp();
  user.emailOtpExpiresAt = getOtpExpiry(10);
  await user.save();

  await sendEmailOtp({ to: user.email, otp: user.emailOtp });

  return sendSuccess(res, "Email OTP resent successfully");
});

export const resendMobileOtp = asyncHandler(async (req, res) => {
  const { phone, countryCode, email } = req.body;

  const formattedPhone = normalizePhoneNumber(phone, countryCode || "IN");

  let user;
  if (email) {
    user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+mobileOtp +mobileOtpExpiresAt");
  } else {
    user = await User.findOne({
      $or: [
        { phone: String(phone || "").trim() },
        { phone: formattedPhone },
      ],
    }).select("+mobileOtp +mobileOtpExpiresAt");
  }

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.mobileVerified) {
    return sendSuccess(res, "Mobile number is already verified", { user: user.toJSON() });
  }

  user.mobileOtp = generateOtp();
  user.mobileOtpExpiresAt = getOtpExpiry(10);
  await user.save();

  await sendMobileOtp({
    to: user.phone,
    otp: user.mobileOtp,
    countryCode: user.phoneCountry || countryCode || "IN",
  });

  return sendSuccess(res, "Mobile OTP resent successfully");
});

export const changeVerificationPhone = asyncHandler(async (req, res) => {
  const { email, newPhone, countryCode } = req.body;

  if (!email || !newPhone) {
    const error = new Error("Email and new mobile number are required");
    error.statusCode = 400;
    throw error;
  }

  const rawPhone = String(newPhone || "").trim();
  if (rawPhone.startsWith("0")) {
    const error = new Error("Mobile number cannot start with 0 as country code is already selected");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+mobileOtp +mobileOtpExpiresAt"
  );

  if (!user) {
    const error = new Error("Account not found for the provided email");
    error.statusCode = 404;
    throw error;
  }

  const targetCountry = countryCode || user.phoneCountry || "IN";
  const formattedPhone = normalizePhoneNumber(rawPhone, targetCountry);

  // If not the authorized duplicate number, ensure no other account has it
  if (!isAllowedDuplicatePhone(rawPhone)) {
    const existing = await User.findOne({
      phone: formattedPhone,
      _id: { $ne: user._id },
    });
    if (existing) {
      const error = new Error("Mobile number is already registered to another account");
      error.statusCode = 409;
      throw error;
    }
  }

  user.phone = formattedPhone;
  user.phoneCountry = targetCountry;
  user.mobileVerified = false;
  user.mobileOtp = generateOtp();
  user.mobileOtpExpiresAt = getOtpExpiry(10);
  await user.save();

  await sendMobileOtp({
    to: user.phone,
    otp: user.mobileOtp,
    countryCode: user.phoneCountry,
  });

  return sendSuccess(
    res,
    `Mobile number updated to ${formattedPhone}. A new verification code has been dispatched.`,
    {
      phone: formattedPhone,
      phoneCountry: user.phoneCountry,
    }
  );
});

export const sendLoginOtp = asyncHandler(async (req, res) => {
  const { identifier, countryCode } = req.body;
  if (!identifier) {
    const error = new Error("Please provide your email address or mobile number");
    error.statusCode = 400;
    throw error;
  }

  const trimmed = String(identifier).trim();
  const isEmail = /^\S+@\S+\.\S+$/.test(trimmed);
  const normalizedPhone = !isEmail ? normalizePhoneNumber(trimmed, countryCode || "IN") : null;

  const user = await User.findOne(
    isEmail
      ? { email: trimmed.toLowerCase() }
      : { $or: [{ phone: trimmed }, { phone: normalizedPhone }] }
  ).select("+emailOtp +emailOtpExpiresAt +mobileOtp +mobileOtpExpiresAt");

  if (!user) {
    const error = new Error("No account found with that " + (isEmail ? "email address" : "mobile number"));
    error.statusCode = 404;
    throw error;
  }

  if (user.status === "inactive") {
    const error = new Error("Your account is inactive. Please contact your administrator.");
    error.statusCode = 403;
    throw error;
  }

  const otp = generateOtp();
  const expiresAt = getOtpExpiry(10);

  if (isEmail) {
    user.emailOtp = otp;
    user.emailOtpExpiresAt = expiresAt;
    await user.save();
    await sendEmailOtp({ to: user.email, otp });
    return sendSuccess(res, `Verification OTP has been dispatched to ${user.email}`, {
      type: "email",
      destination: user.email,
    });
  } else {
    user.mobileOtp = otp;
    user.mobileOtpExpiresAt = expiresAt;
    await user.save();
    await sendMobileOtp({
      to: user.phone,
      otp,
      countryCode: user.phoneCountry || countryCode || "IN",
    });
    return sendSuccess(res, `Verification OTP has been dispatched to ${user.phone}`, {
      type: "phone",
      destination: user.phone,
    });
  }
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { identifier, otp, countryCode } = req.body;
  if (!identifier || !otp) {
    const error = new Error("Identifier and OTP code are required");
    error.statusCode = 400;
    throw error;
  }

  const trimmed = String(identifier).trim();
  const isEmail = /^\S+@\S+\.\S+$/.test(trimmed);
  const normalizedPhone = !isEmail ? normalizePhoneNumber(trimmed, countryCode || "IN") : null;

  const user = await User.findOne(
    isEmail
      ? { email: trimmed.toLowerCase() }
      : { $or: [{ phone: trimmed }, { phone: normalizedPhone }] }
  ).select("+emailOtp +emailOtpExpiresAt +mobileOtp +mobileOtpExpiresAt");

  if (!user) {
    const error = new Error("No account found");
    error.statusCode = 404;
    throw error;
  }

  if (isEmail) {
    if (!user.emailOtp || user.emailOtp !== String(otp).trim()) {
      const error = new Error("Invalid email OTP code");
      error.statusCode = 400;
      throw error;
    }
    if (user.emailOtpExpiresAt < new Date()) {
      const error = new Error("Email OTP code has expired");
      error.statusCode = 400;
      throw error;
    }
    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiresAt = undefined;
  } else {
    if (user.mobileOtpExpiresAt && user.mobileOtpExpiresAt < new Date()) {
      const error = new Error("Mobile OTP code has expired");
      error.statusCode = 400;
      throw error;
    }
    const check = await checkMobileVerification({
      to: user.phone,
      otp,
      userOtp: user.mobileOtp,
      countryCode: user.phoneCountry || countryCode || "IN",
    });
    if (!check.success) {
      const error = new Error(check.message || "Invalid mobile OTP code");
      error.statusCode = 400;
      throw error;
    }
    user.mobileVerified = true;
    user.mobileOtp = undefined;
    user.mobileOtpExpiresAt = undefined;
  }

  await user.save();

  const token = generateToken(user);
  return sendSuccess(res, "Login successful via OTP", {
    token,
    user: user.toJSON(),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: String(email || "").trim().toLowerCase(),
  });

  // Never leak whether email exists in database
  if (!user) {
    return sendSuccess(
      res,
      "If that email address is registered, instructions to reset your password have been sent."
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });

  return sendSuccess(
    res,
    "If that email address is registered, instructions to reset your password have been sent."
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    const error = new Error("Token and new password are required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    const error = new Error(
      "Password must be at least 8 characters long and contain at least one letter and one number"
    );
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpiresAt");

  if (!user) {
    const error = new Error("Password reset token is invalid or has expired");
    error.statusCode = 400;
    throw error;
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return sendSuccess(res, "Password reset successfully. You can now log in.");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const error = new Error("Current and new password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.comparePassword(currentPassword))) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    const error = new Error(
      "New password must be at least 8 characters long and contain at least one letter and one number"
    );
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, "Password changed successfully");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "address",
    "skills",
  ];

  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.body.phone !== undefined) {
    const rawPhone = String(req.body.phone).trim();
    if (rawPhone.startsWith("0")) {
      const error = new Error("Mobile number cannot start with 0 as country code is already selected");
      error.statusCode = 400;
      throw error;
    }
    const targetCountry = req.body.phoneCountry || user.phoneCountry || "IN";
    const formattedPhone = normalizePhoneNumber(rawPhone, targetCountry);
    if (!isAllowedDuplicatePhone(rawPhone)) {
      const existing = await User.findOne({
        phone: formattedPhone,
        _id: { $ne: user._id },
      });
      if (existing) {
        const error = new Error("Mobile number is already registered to another account");
        error.statusCode = 409;
        throw error;
      }
    }
    user.phone = formattedPhone;
    user.phoneCountry = targetCountry;
  }

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "skills") {
        user.skills = parseSkills(req.body.skills);
      } else {
        user[field] = req.body[field];
      }
    }
  });

  // Profile photo update (supports both single file and field array)
  const profilePhotoFile = req.files?.profilePhoto?.[0] || req.file;
  if (profilePhotoFile) {
    user.profilePhoto = buildFileInfo(profilePhotoFile);
  }

  // Handle removed document indexes
  if (req.body.removedDocumentIndexes) {
    try {
      const raw = req.body.removedDocumentIndexes;
      const indexesToRemove = Array.isArray(raw)
        ? raw.map(Number)
        : JSON.parse(raw).map(Number);

      user.documents = (user.documents || []).filter(
        (_, idx) => !indexesToRemove.includes(idx)
      );
    } catch {
      // ignore JSON parse error
    }
  }

  // Handle newly uploaded documents
  const newDocFiles = req.files?.documents || [];
  if (newDocFiles.length > 0) {
    const newDocs = newDocFiles.map(buildFileInfo);
    const combined = [...(user.documents || []), ...newDocs];
    if (combined.length > 5) {
      const error = new Error("Maximum 5 documents allowed on profile. Please remove existing documents first.");
      error.statusCode = 400;
      throw error;
    }
    user.documents = combined;
  }

  await user.save();

  return sendSuccess(res, "Profile updated successfully", { user: user.toJSON() });
});

export const uploadProfileDocuments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
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
  const combined = [...(user.documents || []), ...newDocs];

  if (combined.length > 5) {
    const error = new Error("Maximum 5 documents can be stored. Please remove an existing document first.");
    error.statusCode = 400;
    throw error;
  }

  user.documents = combined;
  await user.save();

  return sendSuccess(res, "Document(s) uploaded successfully", { user: user.toJSON() });
});

export const deleteProfileDocument = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { index } = req.params;
  const docIdx = parseInt(index, 10);

  if (isNaN(docIdx) || docIdx < 0 || docIdx >= (user.documents || []).length) {
    const error = new Error("Invalid document specified");
    error.statusCode = 400;
    throw error;
  }

  user.documents.splice(docIdx, 1);
  await user.save();

  return sendSuccess(res, "Document deleted successfully", { user: user.toJSON() });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, credential, accessToken, profile } = req.body;
  const tokenToVerify = idToken || credential;

  let googleProfile = null;

  if (accessToken) {
    try {
      googleProfile = await verifyGoogleAccessToken(accessToken);
    } catch (err) {
      console.warn("[Google Auth] Access token verification failed:", err.message);
    }
  }

  if (!googleProfile && tokenToVerify) {
    try {
      googleProfile = await verifyGoogleToken(tokenToVerify);
    } catch (err) {
      console.warn("[Google Auth] ID token verification failed:", err.message);
    }
  }

  // Support direct profile payload (e.g. client verified or simulated dev mode)
  if (!googleProfile && profile && profile.email) {
    googleProfile = {
      email: String(profile.email).toLowerCase().trim(),
      firstName:
        profile.firstName ||
        profile.given_name ||
        profile.name?.split(" ")[0] ||
        "Employee",
      lastName:
        profile.lastName ||
        profile.family_name ||
        profile.name?.split(" ").slice(1).join(" ") ||
        "User",
      picture: profile.picture,
      emailVerified: true,
    };
  }

  if (!googleProfile?.email) {
    const error = new Error(
      "Google authentication failed. Please check credentials or sign in again."
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = googleProfile.email.toLowerCase().trim();
  const adminEmails = (process.env.ADMIN_EMAILS || "admin@employeehub.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminEmail = adminEmails.includes(normalizedEmail);

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Generate guaranteed unique mobile phone number for Google SSO users
    let uniquePhone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    let exists = await User.findOne({ phone: uniquePhone });
    while (exists) {
      uniquePhone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      exists = await User.findOne({ phone: uniquePhone });
    }

    user = await User.create({
      firstName: googleProfile.firstName || "Employee",
      lastName: googleProfile.lastName || "User",
      email: normalizedEmail,
      phone: uniquePhone,
      password: crypto.randomBytes(16).toString("hex") + "A1!",
      department: "Engineering",
      employmentType: "Full Time",
      joiningDate: new Date(),
      termsAccepted: true,
      role: isAdminEmail ? "admin" : "employee",
      status: "active",
      isVerified: true,
      mobileVerified: true,
      profilePhoto: googleProfile.picture
        ? {
            name: "Google Avatar",
            path: googleProfile.picture,
            mimeType: "image/jpeg",
          }
        : undefined,
    });
  } else {
    // For existing users, synchronize admin role if explicitly in ADMIN_EMAILS
    if (isAdminEmail && user.role !== "admin") {
      user.role = "admin";
    }
    user.isVerified = true;
    user.mobileVerified = true;
    if (user.status !== "active") {
      user.status = "active";
    }
    if (!user.profilePhoto?.path && googleProfile.picture) {
      user.profilePhoto = {
        name: "Google Avatar",
        path: googleProfile.picture,
        mimeType: "image/jpeg",
      };
    }
    await user.save();
  }

  const token = generateToken(user);

  return sendSuccess(res, "Google authentication successful", {
    token,
    user: user.toJSON(),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, "Authenticated user fetched successfully", {
    user: req.user,
  });
});
