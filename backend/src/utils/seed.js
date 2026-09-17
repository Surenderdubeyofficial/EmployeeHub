import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employeehub");
    console.log("MongoDB connected.");

    // Check if admin already exists
    let admin = await User.findOne({ email: "admin@employeehub.com" });
    if (!admin) {
      console.log("Creating Admin user: admin@employeehub.com...");
      admin = await User.create({
        firstName: "System",
        lastName: "Admin",
        email: "admin@employeehub.com",
        phone: "+919876543210",
        phoneCountry: "IN",
        password: "Password@123",
        department: "IT",
        employmentType: "Full Time",
        joiningDate: new Date("2023-01-01"),
        experience: 8,
        skills: ["System Administration", "Security", "Node.js", "Cloud Architecture"],
        address: "100 Corporate Way, Floor 5, Tech City",
        role: "admin",
        termsAccepted: true,
        isVerified: true,
        mobileVerified: true,
      });
      console.log("Admin user created.");
    }

    // Check if employees exist
    let emp1 = await User.findOne({ email: "aisha@employeehub.com" });
    if (!emp1) {
      console.log("Creating sample employee Aisha Khan...");
      emp1 = await User.create({
        firstName: "Aisha",
        lastName: "Khan",
        email: "aisha@employeehub.com",
        phone: "+919876543211",
        phoneCountry: "IN",
        password: "Password@123",
        department: "Engineering",
        employmentType: "Full Time",
        joiningDate: new Date("2024-03-15"),
        experience: 5,
        skills: ["React.js", "Next.js", "Node.js", "MongoDB", "TypeScript"],
        address: "Flat 402, Greenfield Apartments, Sector 12",
        role: "employee",
        termsAccepted: true,
        isVerified: true,
        mobileVerified: true,
      });
    }

    let emp2 = await User.findOne({ email: "rahul@employeehub.com" });
    if (!emp2) {
      console.log("Creating sample employee Rahul Verma...");
      emp2 = await User.create({
        firstName: "Rahul",
        lastName: "Verma",
        email: "rahul@employeehub.com",
        phone: "+919876543212",
        phoneCountry: "IN",
        password: "Password@123",
        department: "Human Resources",
        employmentType: "Full Time",
        joiningDate: new Date("2024-06-01"),
        experience: 4,
        skills: ["Talent Acquisition", "Employee Relations", "HR Operations"],
        address: "Plot 24, Sunshine Residency, City Center",
        role: "employee",
        termsAccepted: true,
        isVerified: true,
        mobileVerified: true,
      });
    }

    let emp3 = await User.findOne({ email: "priya@employeehub.com" });
    if (!emp3) {
      console.log("Creating sample employee Priya Singh...");
      emp3 = await User.create({
        firstName: "Priya",
        lastName: "Singh",
        email: "priya@employeehub.com",
        phone: "+919876543213",
        phoneCountry: "IN",
        password: "Password@123",
        department: "Finance",
        employmentType: "Full Time",
        joiningDate: new Date("2024-08-10"),
        experience: 3,
        skills: ["Financial Analysis", "Payroll", "Budgeting", "Excel"],
        address: "A-12, Green Avenue, North Block",
        role: "employee",
        status: "on-leave",
        termsAccepted: true,
        isVerified: true,
        mobileVerified: true,
      });
    }

    // Create sample tasks
    const existingTasksCount = await Task.countDocuments();
    if (existingTasksCount === 0) {
      console.log("Seeding initial tasks...");
      await Task.create([
        {
          title: "Implement Authentication Flow",
          description: "Complete JWT authentication, role guards, and mobile OTP validation.",
          assignedTo: emp1._id,
          createdBy: admin._id,
          priority: "High",
          status: "In Progress",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Setup Q3 Onboarding Schedule",
          description: "Prepare orientation material and assign buddy mentors for new hires.",
          assignedTo: emp2._id,
          createdBy: admin._id,
          priority: "Medium",
          status: "Pending",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Audit Quarterly Expense Reports",
          description: "Review financial logs and reconcile corporate reimbursements.",
          assignedTo: emp3._id,
          createdBy: admin._id,
          priority: "Urgent",
          status: "Completed",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Update API Documentation",
          description: "Document all endpoints for employee, task, and attendance modules.",
          assignedTo: emp1._id,
          createdBy: admin._id,
          priority: "Low",
          status: "Pending",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log("Tasks seeded.");
    }

    // Seed sample attendance
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: emp1._id,
      date: { $gte: todayStart },
    });

    if (!existingAttendance) {
      console.log("Seeding sample attendance for today...");
      const checkInTime = new Date(today);
      checkInTime.setHours(9, 15, 0, 0);

      await Attendance.create([
        {
          employee: emp1._id,
          date: today,
          status: "Present",
          checkIn: checkInTime,
          notes: "Regular shift check-in",
        },
        {
          employee: emp2._id,
          date: today,
          status: "Present",
          checkIn: new Date(today.getTime() - 2 * 60 * 60 * 1000),
          notes: "On-time arrival",
        },
        {
          employee: emp3._id,
          date: today,
          status: "On Leave",
          notes: "Approved medical leave",
        },
      ]);
      console.log("Attendance seeded.");
    }

    console.log("Database seeding completed successfully!");
    console.log("\nCredentials to log in:");
    console.log("Admin:    admin@employeehub.com    / Password@123");
    console.log("Employee: aisha@employeehub.com    / Password@123");
    console.log("Employee: rahul@employeehub.com    / Password@123");
    console.log("Employee: priya@employeehub.com    / Password@123\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
