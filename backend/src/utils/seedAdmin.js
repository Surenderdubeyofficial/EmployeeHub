import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedAdminAccount = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employeehub";

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");

    const adminEmail = process.env.PRIMARY_ADMIN_EMAIL || "surenderdubey9582@gmail.com";
    const adminPassword = process.env.PRIMARY_ADMIN_PASSWORD || "Naumik@9582";
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Found existing user for ${adminEmail}. Updating credentials and admin role...`);
      admin.firstName = "Surender";
      admin.lastName = "Dubey";
      admin.fullName = "Surender Dubey";
      admin.password = adminPassword;
      admin.role = "admin";
      admin.status = "active";
      admin.isVerified = true;
      admin.mobileVerified = true;
      if (!admin.department) admin.department = "Executive";
      await admin.save();
      console.log(`Admin account [${adminEmail}] successfully updated to role 'admin'.`);
    } else {
      console.log(`Creating new primary Admin account for ${adminEmail}...`);
      admin = await User.create({
        firstName: "Surender",
        lastName: "Dubey",
        fullName: "Surender Dubey",
        email: adminEmail,
        phone: "+919582000001",
        phoneCountry: "IN",
        password: adminPassword,
        role: "admin",
        status: "active",
        department: "Executive",
        employmentType: "Full Time",
        joiningDate: new Date(),
        termsAccepted: true,
        isVerified: true,
        mobileVerified: true,
        skills: ["Administration", "Management", "Operations"],
      });
      console.log(`Admin account [${adminEmail}] successfully created.`);
    }

    console.log("\nAdmin Account Details:");
    console.log(`- Name: ${admin.fullName}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Status: ${admin.status}`);
    console.log(`- Verified: ${admin.isVerified && admin.mobileVerified ? "YES" : "NO"}`);
    
    await mongoose.disconnect();
    console.log("MongoDB disconnected. Ready.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin account:", err);
    process.exit(1);
  }
};

seedAdminAccount();
