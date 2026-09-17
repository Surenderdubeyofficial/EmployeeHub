import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const documentSchema = new mongoose.Schema(
  {
    name: String,
    path: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    phoneCountry: {
      type: String,
      trim: true,
      default: "IN",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Intern", "Contract"],
      required: [true, "Employment type is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    profilePhoto: {
      name: String,
      path: String,
      mimeType: String,
      size: Number,
    },
    documents: {
      type: [documentSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 5;
        },
        message: "Maximum 5 documents are allowed",
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    termsAccepted: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "ceo", "hr", "manager", "employee"],
      default: "employee",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
      select: false,
    },
    emailOtpExpiresAt: {
      type: Date,
      select: false,
    },
    mobileOtp: {
      type: String,
      select: false,
    },
    mobileOtpExpiresAt: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });

userSchema.pre("save", async function hashPassword() {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.emailOtp;
  delete user.emailOtpExpiresAt;
  delete user.mobileOtp;
  delete user.mobileOtpExpiresAt;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpiresAt;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
