import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";

dotenv.config();

// Pre-defined first and last names for realistic generation
const FIRST_NAMES = [
  "Aarav", "Aanya", "Aditya", "Advait", "Akshay", "Ananya", "Aniket", "Ankita", "Arjun", "Bhavna",
  "Chetan", "Deepika", "Dev", "Divya", "Gaurav", "Harsh", "Isha", "Ishaan", "Jaya", "Karan",
  "Kavita", "Kunal", "Lakshmi", "Manish", "Meera", "Mohit", "Neha", "Nikhil", "Nisha", "Pooja",
  "Pranav", "Priya", "Rahul", "Rajesh", "Riya", "Rohan", "Rohit", "Sameer", "Sanjay", "Shreya",
  "Siddharth", "Sneha", "Sunil", "Sunita", "Tanvi", "Varun", "Vikram", "Vishal", "Yash", "Zara",
  "Alexander", "Charlotte", "Daniel", "Emily", "James", "Jessica", "Lucas", "Olivia", "William", "Sophia"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Singh", "Gupta", "Deshmukh", "Joshi", "Chopra", "Reddy", "Nair",
  "Mehta", "Bhatia", "Malhotra", "Kapoor", "Saxena", "Iyer", "Rao", "Pandey", "Mishra", "Agarwal",
  "Kulkarni", "Choudhury", "Bose", "Ghosh", "Mukherjee", "Das", "Menon", "Pillai", "Shetty", "Hegde",
  "Singhania", "Trivedi", "Shukla", "Dubey", "Goswami", "Thakur", "Yadav", "Tripathi", "Sinha", "Chatterjee",
  "Miller", "Smith", "Johnson", "Brown", "Williams", "Taylor", "Anderson", "Thomas", "Jackson", "White"
];

const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Product",
  "Legal",
  "Customer Support",
  "IT & Infrastructure",
];

const DEPARTMENT_SKILLS = {
  Engineering: ["React.js", "Node.js", "TypeScript", "Python", "MongoDB", "AWS", "Docker", "Kubernetes", "GraphQL", "System Design"],
  "Human Resources": ["Talent Acquisition", "Employee Relations", "HR Operations", "Payroll & Benefits", "Performance Management", "Conflict Resolution", "HRIS"],
  Finance: ["Financial Modeling", "Corporate Accounting", "Auditing", "Taxation", "Budget Forecasting", "QuickBooks", "ERP Systems"],
  Marketing: ["SEO / SEM", "Content Strategy", "Digital Marketing", "Social Media Campaigns", "Brand Storytelling", "Google Analytics", "HubSpot"],
  Sales: ["Enterprise Sales", "Lead Generation", "CRM Management", "Contract Negotiation", "Sales Forecasting", "Account Management"],
  Operations: ["Supply Chain Logistics", "Process Optimization", "Vendor Management", "Quality Assurance", "Six Sigma", "Project Management"],
  Product: ["Product Roadmap", "User Research", "Agile / Scrum", "Wireframing", "Feature Prioritization", "A/B Testing", "Data Analysis"],
  Legal: ["Corporate Governance", "Contract Review", "Regulatory Compliance", "Intellectual Property", "Employment Law", "Risk Management"],
  "Customer Support": ["Client Communication", "Incident Resolution", "Zendesk", "Customer Retention", "Technical Troubleshooting", "SLA Management"],
  "IT & Infrastructure": ["Network Security", "Active Directory", "Linux Administration", "Cloud Security", "Disaster Recovery", "VPN & Firewalls"],
};

const CITIES = [
  "Indiranagar, Bangalore, Karnataka",
  "Bandra West, Mumbai, Maharashtra",
  "Cyber City, Gurugram, Haryana",
  "HITEC City, Hyderabad, Telangana",
  "Viman Nagar, Pune, Maharashtra",
  "OMR IT Corridor, Chennai, Tamil Nadu",
  "Sector 62, Noida, Uttar Pradesh",
  "Salt Lake Sector V, Kolkata, West Bengal",
  "C.G. Road, Ahmedabad, Gujarat",
  "Bani Park, Jaipur, Rajasthan",
  "Manhattan, New York, NY, USA",
  "Canary Wharf, London, UK",
  "Marina Bay, Singapore",
];

const ROLES = ["admin", "ceo", "hr", "manager", "employee"];

const seedFiftyUsersPerRole = async () => {
  try {
    console.log("=== STARTING 50 USERS PER ROLE SEEDING SCRIPT ===");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const hashedPassword = await bcrypt.hash("Password@123", 12);
    const surenderHashedPassword = await bcrypt.hash("Naumik@9582", 12);

    // Keep track of phone numbers to ensure no collisions
    const usedPhones = new Set();
    const usedEmails = new Set();

    // Preserve Surender Dubey (Primary Admin)
    const existingSurender = await User.findOne({ email: "surenderdubey9582@gmail.com" });
    if (existingSurender) {
      usedEmails.add("surenderdubey9582@gmail.com");
      usedPhones.add(existingSurender.phone);
    }

    const usersToInsert = [];
    const spotlightLogins = {};

    let phoneCounter = 9811001000;

    for (const role of ROLES) {
      console.log(`Generating 50 realistic users for role: ${role.toUpperCase()}...`);

      for (let i = 0; i < 50; i++) {
        let firstName = FIRST_NAMES[(i * 3 + ROLES.indexOf(role) * 7) % FIRST_NAMES.length];
        let lastName = LAST_NAMES[(i * 5 + ROLES.indexOf(role) * 11) % LAST_NAMES.length];
        const department = DEPARTMENTS[i % DEPARTMENTS.length];
        const deptSkills = DEPARTMENT_SKILLS[department] || ["Problem Solving", "Communication"];

        let email = "";
        let phone = "";
        let isSpotlight = false;
        let userPassword = hashedPassword;

        if (i === 0) {
          // Spotlight account for this role
          isSpotlight = true;
          if (role === "admin") {
            firstName = "Surender";
            lastName = "Dubey";
            email = "surenderdubey9582@gmail.com";
            phone = "+919582514339";
            userPassword = surenderHashedPassword;
            spotlightLogins[role] = {
              role: "admin",
              name: "Surender Dubey (Primary Admin)",
              email: "surenderdubey9582@gmail.com",
              password: "Naumik@9582",
              department: "IT & Infrastructure",
            };
          } else if (role === "ceo") {
            firstName = "Vikramaditya";
            lastName = "Singhania";
            email = "ceo@employeehub.com";
            phone = "+919820010001";
            spotlightLogins[role] = {
              role: "ceo",
              name: "Vikramaditya Singhania (Chief Executive Officer)",
              email: "ceo@employeehub.com",
              password: "Password@123",
              department: "Executive Management",
            };
          } else if (role === "hr") {
            firstName = "Pooja";
            lastName = "Sharma";
            email = "hr@employeehub.com";
            phone = "+919820010002";
            spotlightLogins[role] = {
              role: "hr",
              name: "Pooja Sharma (Head of People & Culture)",
              email: "hr@employeehub.com",
              password: "Password@123",
              department: "Human Resources",
            };
          } else if (role === "manager") {
            firstName = "Rohan";
            lastName = "Deshmukh";
            email = "manager@employeehub.com";
            phone = "+919820010003";
            spotlightLogins[role] = {
              role: "manager",
              name: "Rohan Deshmukh (Engineering Director)",
              email: "manager@employeehub.com",
              password: "Password@123",
              department: "Engineering",
            };
          } else if (role === "employee") {
            firstName = "Aarav";
            lastName = "Mehta";
            email = "employee@employeehub.com";
            phone = "+919820010004";
            spotlightLogins[role] = {
              role: "employee",
              name: "Aarav Mehta (Senior Software Engineer)",
              email: "employee@employeehub.com",
              password: "Password@123",
              department: "Engineering",
            };
          }
        } else if (i === 1 && role === "admin") {
          // Secondary admin account
          firstName = "System";
          lastName = "Admin";
          email = "admin@employeehub.com";
          phone = "+919820010005";
        } else {
          // Standard numbered/named account
          email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${role}${i}@employeehub.com`;
          while (usedEmails.has(email)) {
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${role}${i}_${Math.floor(Math.random() * 1000)}@employeehub.com`;
          }

          phone = `+91${phoneCounter++}`;
          while (usedPhones.has(phone)) {
            phone = `+91${phoneCounter++}`;
          }
        }

        usedEmails.add(email);
        usedPhones.add(phone);

        // Status distribution: 88% active, 8% on-leave, 4% inactive
        let status = "active";
        if (i % 25 === 0 && i !== 0) status = "inactive";
        else if (i % 12 === 0 && i !== 0) status = "on-leave";

        // Employment types: 80% Full Time, 10% Contract, 6% Part Time, 4% Intern
        let employmentType = "Full Time";
        if (i % 20 === 0) employmentType = "Intern";
        else if (i % 15 === 0) employmentType = "Part Time";
        else if (i % 10 === 0) employmentType = "Contract";

        // Joining date scattered over last 4 years
        const daysAgo = Math.floor(Math.random() * 1200) + 30;
        const joiningDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        // Experience 1 to 15 years
        const experience = role === "ceo" ? 14 + (i % 8) : role === "manager" ? 8 + (i % 6) : 2 + (i % 7);

        // Selected 3 to 5 skills
        const userSkills = deptSkills.slice(0, 3 + (i % 3));

        const address = CITIES[(i + ROLES.indexOf(role)) % CITIES.length];

        usersToInsert.push({
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          phone,
          phoneCountry: "IN",
          password: userPassword,
          role,
          department: role === "ceo" ? (i === 0 ? "Executive Management" : department) : department,
          employmentType,
          status,
          joiningDate,
          experience,
          skills: userSkills,
          address,
          termsAccepted: true,
          isVerified: true,
          mobileVerified: true,
          createdAt: joiningDate,
          updatedAt: new Date(),
        });
      }
    }

    console.log(`Generated ${usersToInsert.length} total user records.`);

    // Upsert or insert users without duplicates
    let insertedCount = 0;
    let updatedCount = 0;

    for (const u of usersToInsert) {
      const res = await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (res) insertedCount++;
    }

    console.log(`Successfully processed and persisted ${insertedCount} users into MongoDB!`);

    // Fetch sample users for generating realistic tasks and attendance
    const allUsers = await User.find({ status: "active" });
    const managersAndAdmins = allUsers.filter((u) => ["admin", "manager", "ceo"].includes(u.role));
    const regularStaff = allUsers.filter((u) => ["employee", "hr", "manager"].includes(u.role));

    console.log("Generating realistic Tasks across sprints and departments...");
    const sampleTaskTitles = [
      "Implement Multi-Region Redis Cache Cluster",
      "Draft Q4 Employee Compensation & Equity Review",
      "Revamp Enterprise Customer Onboarding SLA",
      "Conduct Comprehensive SOC-2 Compliance Audit",
      "Migrate Core Services to Next.js 16 Architecture",
      "Deliver Mobile App Biometric Authentication",
      "Optimize MongoDB Aggregate Pipeline Latency",
      "Design Executive Financial Runway Model for Board",
      "Finalize Global Remote Workforce Policy",
      "Scale Kubernetes Ingress Controller Throughput",
      "Conduct Penetration Testing on Payment Gateways",
      "Build Automated Talent Sourcing LinkedIn Pipeline",
      "Implement Dark Mode & Accessible Typography UI",
      "Deploy Automated Daily Database Backup Replication",
      "Prepare Annual Environmental & Social Governance Report",
    ];

    const tasksToInsert = [];
    for (let t = 0; t < 60; t++) {
      const creator = managersAndAdmins[t % managersAndAdmins.length];
      const assignee = regularStaff[(t * 3) % regularStaff.length];
      const title = sampleTaskTitles[t % sampleTaskTitles.length] + ` (Sprint ${Math.floor(t / 10) + 1})`;
      const priorities = ["Low", "Medium", "High", "Urgent"];
      const statuses = ["Pending", "In Progress", "Completed", "In Progress", "Pending"];

      tasksToInsert.push({
        title,
        description: `High-priority objective for ${assignee.department} department. Ensure alignment with enterprise standards, unit tests, and security reviews before staging rollout.`,
        assignedTo: assignee._id,
        createdBy: creator._id,
        priority: priorities[t % priorities.length],
        status: statuses[t % statuses.length],
        dueDate: new Date(Date.now() + (t % 14 - 4) * 24 * 60 * 60 * 1000),
      });
    }

    // Clear and re-populate sample tasks
    await Task.deleteMany({ title: { $regex: "Sprint" } });
    await Task.insertMany(tasksToInsert);
    console.log(`Successfully created ${tasksToInsert.length} enterprise tasks!`);

    // Generate Attendance Records for Today
    console.log("Generating Attendance records for active workforce...");
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attendanceToInsert = [];
    for (let a = 0; a < Math.min(allUsers.length, 120); a++) {
      const user = allUsers[a];
      const checkInTime = new Date(today);
      checkInTime.setUTCHours(9, Math.floor(Math.random() * 45), 0, 0);

      const checkOutTime = new Date(today);
      checkOutTime.setUTCHours(18, Math.floor(Math.random() * 30), 0, 0);

      const status = user.status === "on-leave" ? "On Leave" : (a % 15 === 0 ? "Absent" : "Present");

      attendanceToInsert.push({
        employee: user._id,
        date: today,
        status,
        checkIn: status === "Present" ? checkInTime : undefined,
        checkOut: status === "Present" && a % 3 === 0 ? checkOutTime : undefined,
        notes: status === "Present" ? "Regular biometric check-in" : (status === "On Leave" ? "Approved Annual Leave" : "Unplanned Absence"),
      });
    }

    // Clear today's attendance and insert fresh batch
    await Attendance.deleteMany({ date: today });
    await Attendance.insertMany(attendanceToInsert);
    console.log(`Successfully created ${attendanceToInsert.length} attendance records for today!`);

    // Verify Counts by Role
    const stats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    console.log("\n=== DATABASE WORKFORCE BREAKDOWN BY ROLE ===");
    console.table(stats);

    console.log("\n=== 🔑 SPOTLIGHT LOGIN CREDENTIALS (FOR USER TESTING) ===");
    console.table(Object.values(spotlightLogins));

    console.log("\n[SUCCESS] Seeding complete! 250+ enterprise users, tasks, and attendance are live in MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedFiftyUsersPerRole();
