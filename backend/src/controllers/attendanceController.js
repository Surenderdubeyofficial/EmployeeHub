import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const getDayRange = (dateStr) => {
  const target = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(target);
  start.setHours(0, 0, 0, 0);

  const end = new Date(target);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, status, month, year } = req.query;

  const filter = {};

  const userRole = req.user.role || "employee";
  const userDept = req.user.department || "Engineering";

  if (userRole === "admin" || userRole === "ceo" || userRole === "hr") {
    if (employeeId) {
      filter.employee = employeeId;
    }
  } else if (userRole === "manager") {
    const deptRegex = new RegExp(`^${userDept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const deptUsers = await User.find({ department: deptRegex }).select("_id");
    const deptMemberIds = deptUsers.map((u) => u._id);
    if (employeeId && deptMemberIds.some((id) => id.toString() === employeeId.toString())) {
      filter.employee = employeeId;
    } else {
      filter.employee = { $in: deptMemberIds };
    }
  } else {
    filter.employee = req.user._id;
  }

  if (status) {
    filter.status = status;
  }

  if (date) {
    const { start, end } = getDayRange(date);
    filter.date = { $gte: start, $lte: end };
  } else if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const attendance = await Attendance.find(filter)
    .populate("employee", "firstName lastName fullName email department profilePhoto")
    .sort({ date: -1, createdAt: -1 });

  return sendSuccess(res, "Attendance records fetched successfully", { attendance });
});

export const getTodayAttendance = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();

  const todayRecord = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: start, $lte: end },
  });

  return sendSuccess(res, "Today's attendance fetched successfully", {
    attendance: todayRecord,
  });
});

export const checkIn = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();
  const now = new Date();

  let record = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: start, $lte: end },
  });

  if (record) {
    if (record.checkIn) {
      const error = new Error("You have already checked in today");
      error.statusCode = 400;
      throw error;
    }

    record.checkIn = now;
    record.status = "Present";
    await record.save();
  } else {
    record = await Attendance.create({
      employee: req.user._id,
      date: now,
      status: "Present",
      checkIn: now,
      notes: req.body.notes || "Self check-in",
    });
  }

  return sendSuccess(res, "Checked in successfully", { attendance: record });
});

export const checkOut = asyncHandler(async (req, res) => {
  const { start, end } = getDayRange();
  const now = new Date();

  let record = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: start, $lte: end },
  });

  if (!record || !record.checkIn) {
    const error = new Error("You must check in before checking out");
    error.statusCode = 400;
    throw error;
  }

  if (record.checkOut) {
    const error = new Error("You have already checked out today");
    error.statusCode = 400;
    throw error;
  }

  record.checkOut = now;
  await record.save();

  return sendSuccess(res, "Checked out successfully", { attendance: record });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { employee, date, status, checkIn: cIn, checkOut: cOut, notes } = req.body;

  if (!employee || !date || !status) {
    const error = new Error("Employee, date, and status are required");
    error.statusCode = 400;
    throw error;
  }

  const employeeExists = await User.findById(employee);
  if (!employeeExists) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  const { start, end } = getDayRange(date);

  let record = await Attendance.findOne({
    employee,
    date: { $gte: start, $lte: end },
  });

  if (record) {
    record.status = status;
    if (cIn) record.checkIn = new Date(cIn);
    if (cOut) record.checkOut = new Date(cOut);
    if (notes !== undefined) record.notes = notes;
    await record.save();
  } else {
    record = await Attendance.create({
      employee,
      date: new Date(date),
      status,
      checkIn: cIn ? new Date(cIn) : undefined,
      checkOut: cOut ? new Date(cOut) : undefined,
      notes,
    });
  }

  await record.populate("employee", "firstName lastName fullName email department");

  return sendSuccess(res, "Attendance saved successfully", { attendance: record }, 201);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("employee", "firstName lastName fullName email department");

  if (!record) {
    const error = new Error("Attendance record not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Attendance record updated successfully", { attendance: record });
});
