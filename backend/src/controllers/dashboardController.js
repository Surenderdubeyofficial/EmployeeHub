import User from "../models/User.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userRole = req.user.role || "employee";
  const userDept = req.user.department || "Engineering";
  const deptRegex = new RegExp(`^${escapeRegex(userDept)}$`, "i");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch current user's personal shift attendance regardless of role
  const todayAttendance = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: todayStart, $lte: todayEnd },
  });

  // ---------------- ADMIN & CEO ----------------
  if (userRole === "admin" || userRole === "ceo") {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      todayAttendanceRecords,
      departmentCounts,
      recentTasks,
      recentEmployees,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: { $ne: "admin" }, status: "active" }),
      User.countDocuments({ role: { $ne: "admin" }, status: "on-leave" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "Pending" }),
      Task.countDocuments({ status: "In Progress" }),
      Task.countDocuments({ status: "Completed" }),
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: "Completed" },
      }),
      Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } }),
      User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Task.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
        .populate("createdBy", "firstName lastName fullName email"),
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("-password"),
    ]);

    const presentToday = todayAttendanceRecords.filter((r) => r.status === "Present").length;
    const absentToday = todayAttendanceRecords.filter((r) => r.status === "Absent").length;
    const onLeaveToday = todayAttendanceRecords.filter((r) => r.status === "On Leave").length;

    return sendSuccess(res, `${userRole.toUpperCase()} dashboard metrics fetched successfully`, {
      role: userRole,
      department: userDept,
      stats: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        attendanceToday: {
          present: presentToday,
          absent: absentToday,
          onLeave: onLeaveToday,
          totalMarked: todayAttendanceRecords.length,
        },
        departmentDistribution: departmentCounts.map((item) => ({
          department: item._id || "General",
          count: item.count,
        })),
      },
      todayAttendance,
      recentTasks,
      recentEmployees,
    });
  }

  // ---------------- HR OPERATIONS ----------------
  if (userRole === "hr") {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      todayAttendanceRecords,
      departmentCounts,
      recentEmployees,
      recentTasks,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: { $ne: "admin" }, status: "active" }),
      User.countDocuments({ role: { $ne: "admin" }, status: "on-leave" }),
      Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } }),
      User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("-password"),
      Task.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
        .populate("createdBy", "firstName lastName fullName email"),
      Task.countDocuments(),
      Task.countDocuments({ status: "Pending" }),
      Task.countDocuments({ status: "In Progress" }),
      Task.countDocuments({ status: "Completed" }),
    ]);

    const presentToday = todayAttendanceRecords.filter((r) => r.status === "Present").length;
    const absentToday = todayAttendanceRecords.filter((r) => r.status === "Absent").length;
    const onLeaveToday = todayAttendanceRecords.filter((r) => r.status === "On Leave").length;

    return sendSuccess(res, "HR Operations metrics fetched successfully", {
      role: "hr",
      department: userDept,
      stats: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        attendanceToday: {
          present: presentToday,
          absent: absentToday,
          onLeave: onLeaveToday,
          totalMarked: todayAttendanceRecords.length,
        },
        departmentDistribution: departmentCounts.map((item) => ({
          department: item._id || "General",
          count: item.count,
        })),
      },
      todayAttendance,
      recentEmployees,
      recentTasks,
    });
  }

  // ---------------- MANAGER TEAM HUB ----------------
  if (userRole === "manager") {
    // 1. Fetch all members in manager's department
    const deptUsers = await User.find({ department: deptRegex }).select(
      "firstName lastName fullName email department status profilePhoto role"
    );
    const deptMemberIds = deptUsers.map((u) => u._id);
    const teamMembers = deptUsers.filter((u) => u._id.toString() !== req.user._id.toString());

    // 2. Query department attendance today
    const teamAttendanceRecords = await Attendance.find({
      employee: { $in: deptMemberIds },
      date: { $gte: todayStart, $lte: todayEnd },
    }).populate("employee", "firstName lastName fullName department");

    const teamPresentToday = teamAttendanceRecords.filter((r) => r.status === "Present").length;
    const teamOnLeaveToday = teamAttendanceRecords.filter((r) => r.status === "On Leave").length;
    const teamAbsentToday = teamAttendanceRecords.filter((r) => r.status === "Absent").length;

    // 3. Department Tasks query (assigned to any dept member, manager, or created by manager)
    const taskFilter = {
      $or: [
        { assignedTo: { $in: deptMemberIds } },
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ],
    };

    const [
      teamTotalTasks,
      teamPendingTasks,
      teamInProgressTasks,
      teamCompletedTasks,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "Pending" }),
      Task.countDocuments({ ...taskFilter, status: "In Progress" }),
      Task.countDocuments({ ...taskFilter, status: "Completed" }),
      Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("assignedTo", "firstName lastName fullName email department profilePhoto")
        .populate("createdBy", "firstName lastName fullName email"),
    ]);

    return sendSuccess(res, "Manager dashboard metrics fetched successfully", {
      role: "manager",
      department: userDept,
      stats: {
        teamMembersCount: teamMembers.length,
        teamPresentToday,
        teamOnLeaveToday,
        teamAbsentToday,
        totalTasks: teamTotalTasks,
        pendingTasks: teamPendingTasks,
        inProgressTasks: teamInProgressTasks,
        completedTasks: teamCompletedTasks,
      },
      todayAttendance,
      teamMembers,
      recentTasks,
    });
  }

  // ---------------- EMPLOYEE WORKSPACE ----------------
  const [
    myTotalTasks,
    myPendingTasks,
    myInProgressTasks,
    myCompletedTasks,
    myOverdueTasks,
    recentTasks,
    upcomingDeadlines,
    teamColleagues,
  ] = await Promise.all([
    Task.countDocuments({ assignedTo: req.user._id }),
    Task.countDocuments({ assignedTo: req.user._id, status: "Pending" }),
    Task.countDocuments({ assignedTo: req.user._id, status: "In Progress" }),
    Task.countDocuments({ assignedTo: req.user._id, status: "Completed" }),
    Task.countDocuments({
      assignedTo: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: "Completed" },
    }),
    Task.find({ assignedTo: req.user._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("assignedTo", "firstName lastName fullName email department")
      .populate("createdBy", "firstName lastName fullName email"),
    Task.find({
      assignedTo: req.user._id,
      dueDate: { $gte: new Date() },
      status: { $ne: "Completed" },
    })
      .sort({ dueDate: 1 })
      .limit(6)
      .populate("assignedTo", "firstName lastName fullName email department")
      .populate("createdBy", "firstName lastName fullName email"),
    User.find({
      department: deptRegex,
      _id: { $ne: req.user._id },
    })
      .select("firstName lastName fullName email department status profilePhoto")
      .limit(6),
  ]);

  return sendSuccess(res, "Employee dashboard statistics fetched successfully", {
    role: "employee",
    department: userDept,
    stats: {
      totalTasks: myTotalTasks,
      pendingTasks: myPendingTasks,
      inProgressTasks: myInProgressTasks,
      completedTasks: myCompletedTasks,
      overdueTasks: myOverdueTasks,
    },
    todayAttendance,
    recentTasks,
    upcomingDeadlines,
    teamColleagues,
  });
});
