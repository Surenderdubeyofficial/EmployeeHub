import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getTasks = asyncHandler(async (req, res) => {
  const userRole = req.user.role || "employee";
  const userDept = req.user.department || "Engineering";
  let filter = {};

  if (userRole === "admin" || userRole === "ceo" || userRole === "hr") {
    filter = {};
  } else if (userRole === "manager") {
    const deptRegex = new RegExp(`^${escapeRegex(userDept)}$`, "i");
    const deptUsers = await User.find({ department: deptRegex }).select("_id");
    const deptMemberIds = deptUsers.map((u) => u._id);
    filter = {
      $or: [
        { assignedTo: { $in: deptMemberIds } },
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ],
    };
  } else {
    filter = { assignedTo: req.user._id };
  }

  const tasks = await Task.find(filter)
    .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
    .populate("createdBy", "firstName lastName fullName email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "Tasks fetched successfully", { tasks });
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
    .populate("createdBy", "firstName lastName fullName email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "My tasks fetched successfully", { tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
    .populate("createdBy", "firstName lastName fullName email");

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const userRole = req.user.role || "employee";
  const isDeptManager =
    userRole === "manager" &&
    task.assignedTo?.department?.toLowerCase() === req.user.department?.toLowerCase();

  const isAuthorized =
    userRole === "admin" ||
    userRole === "ceo" ||
    userRole === "hr" ||
    isDeptManager ||
    task.assignedTo?._id?.toString() === req.user._id.toString() ||
    task.createdBy?._id?.toString() === req.user._id.toString();

  if (!isAuthorized) {
    const error = new Error("You are not allowed to access this task");
    error.statusCode = 403;
    throw error;
  }

  return sendSuccess(res, "Task fetched successfully", { task });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await task.populate("assignedTo", "firstName lastName fullName email department profilePhoto");
  await task.populate("createdBy", "firstName lastName fullName email");

  return sendSuccess(res, "Task created successfully", { task }, 201);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
    .populate("createdBy", "firstName lastName fullName email");

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Task updated successfully", { task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, "Task deleted successfully");
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "In Progress", "Completed", "Cancelled"].includes(status)) {
    const error = new Error("Invalid task status");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(req.params.id).populate("assignedTo", "department");

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const userRole = req.user.role || "employee";
  const isDeptManager =
    userRole === "manager" &&
    task.assignedTo?.department?.toLowerCase() === req.user.department?.toLowerCase();

  const canUpdate =
    userRole === "admin" ||
    userRole === "ceo" ||
    userRole === "hr" ||
    isDeptManager ||
    task.assignedTo?._id?.toString() === req.user._id.toString() ||
    task.assignedTo?.toString() === req.user._id.toString() ||
    task.createdBy?.toString() === req.user._id.toString();

  if (!canUpdate) {
    const error = new Error("You are not allowed to update this task");
    error.statusCode = 403;
    throw error;
  }

  task.status = status;
  await task.save();
  await task.populate("assignedTo", "firstName lastName fullName email department profilePhoto");
  await task.populate("createdBy", "firstName lastName fullName email");

  return sendSuccess(res, "Task status updated successfully", { task });
});
