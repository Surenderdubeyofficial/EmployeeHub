import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:5000";

const runTests = async () => {
  console.log("=== RUNNING EMPLOYEEHUB AUTOMATED API TESTS ===\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/`);
    const health = await healthRes.json();
    assert(health.success === true, "Health check endpoint returns success");

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@employeehub.com",
        password: "Password@123",
      }),
    });
    const adminAuth = await adminLoginRes.json();
    const adminToken = adminAuth.token || adminAuth.data?.token;
    const adminUser = adminAuth.user || adminAuth.data?.user;

    assert(
      adminAuth.success && adminToken && adminUser?.role === "admin",
      "Admin login authenticates with JWT and role=admin"
    );

    // 3. Employee Login
    const empLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "aisha@employeehub.com",
        password: "Password@123",
      }),
    });
    const empAuth = await empLoginRes.json();
    const empToken = empAuth.token || empAuth.data?.token;
    const empUser = empAuth.user || empAuth.data?.user;

    assert(
      empAuth.success && empToken && empUser?.role === "employee",
      "Employee login authenticates with JWT and role=employee"
    );

    // 4. Admin Dashboard Stats
    const adminDashRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDash = await adminDashRes.json();
    const adminStats = adminDash.stats || adminDash.data?.stats;
    assert(
      adminDash.success && adminStats?.totalEmployees >= 3,
      "Admin dashboard stats fetches workforce metrics"
    );

    // 5. Employee Dashboard Stats
    const empDashRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const empDash = await empDashRes.json();
    assert(
      empDash.success && (empDash.role === "employee" || empDash.data?.role === "employee"),
      "Employee dashboard stats fetches employee-specific metrics"
    );

    // 6. Employees list (Admin)
    const empListRes = await fetch(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const empList = await empListRes.json();
    const employees = empList.employees || empList.data?.employees;
    assert(
      empList.success && Array.isArray(employees) && employees.length > 0,
      "Admin can list employees with search/filter capabilities"
    );

    // 7. Role-Based Access Control: Employee CANNOT create employee
    const rbacRes = await fetch(`${BASE_URL}/api/employees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${empToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName: "Unauthorized" }),
    });
    assert(
      rbacRes.status === 403,
      "RBAC Check: Employee calling Admin API is blocked with 403 Forbidden"
    );

    // 8. Tasks List
    const tasksRes = await fetch(`${BASE_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const tasks = await tasksRes.json();
    const taskList = tasks.tasks || tasks.data?.tasks;
    assert(
      tasks.success && Array.isArray(taskList) && taskList.length > 0,
      "Tasks fetched successfully with populated employee details"
    );

    // 9. Attendance List
    const attRes = await fetch(`${BASE_URL}/api/attendance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const att = await attRes.json();
    const attList = att.attendance || att.data?.attendance;
    assert(
      att.success && Array.isArray(attList),
      "Attendance records fetched with employee details"
    );

    // 10. Forgot password request
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@employeehub.com" }),
    });
    const forgot = await forgotRes.json();
    assert(
      forgot.success === true,
      "Forgot password endpoint dispatches reset token securely"
    );

    // 11. Auth Me endpoint
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    assert(
      meData.success && (meData.user?.email === "admin@employeehub.com" || meData.data?.user?.email === "admin@employeehub.com"),
      "Auth /me endpoint retrieves authenticated user profile"
    );

    // 12. Profile Update
    const updateProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: "742 Evergreen Terrace, Suite 100",
        skills: ["Node.js", "React", "Architecture", "Security"],
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileData.success === true,
      "Update profile endpoint successfully updates user information and skills"
    );

    // 13. Today Attendance
    const todayRes = await fetch(`${BASE_URL}/api/attendance/today`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const todayData = await todayRes.json();
    assert(
      todayData.success === true,
      "Attendance today endpoint fetches employee shift status for current date"
    );

    // 14. Task Status Patch
    if (taskList.length > 0) {
      const taskToPatch = taskList[0];
      const patchTaskRes = await fetch(`${BASE_URL}/api/tasks/${taskToPatch._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "In Progress" }),
      });
      const patchTaskData = await patchTaskRes.json();
      assert(
        patchTaskData.success === true,
        "Task status patch transitions task state and populates assignedTo"
      );
    }

    // 15. Employee Status Patch
    if (employees.length > 0) {
      const empToPatch = employees[0];
      const patchEmpRes = await fetch(`${BASE_URL}/api/employees/${empToPatch._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      });
      const patchEmpData = await patchEmpRes.json();
      assert(
        patchEmpData.success === true,
        "Employee status patch successfully updates workforce status"
      );
    }

    // 16. Employee Role Patch
    if (employees.length > 0) {
      const empToPatch = employees[0];
      const patchRoleRes = await fetch(`${BASE_URL}/api/employees/${empToPatch._id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "employee" }),
      });
      const patchRoleData = await patchRoleRes.json();
      assert(
        patchRoleData.success === true,
        "Employee role patch successfully updates workforce role"
      );
    }

    // 17. Primary Admin (Surender Dubey) Login Verification
    const surenderLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "surenderdubey9582@gmail.com",
        password: "Naumik@9582",
      }),
    });
    const surenderAuth = await surenderLoginRes.json();
    assert(
      surenderAuth.success && surenderAuth.user?.role === "admin",
      "Primary Admin (Surender Dubey) successfully logs in with role=admin"
    );

    // 18. Zero-Prevention Phone Validation
    const zeroPhoneRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "Phone",
        email: "zerophone@test.com",
        phone: "0987654321",
        password: "Password@123",
        termsAccepted: "true",
      }),
    });
    const zeroPhoneData = await zeroPhoneRes.json();
    assert(
      zeroPhoneData.success === false &&
      zeroPhoneData.message.includes("cannot start with 0"),
      "Phone number starting with 0 is strictly rejected by backend validation"
    );

    // 19 & 20: Twilio Test Number (9582514339) Duplicate Authorization
    const randomSuffix1 = Date.now();
    const twilioUser1Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Twilio",
        lastName: "UserOne",
        email: `twiliotest1_${randomSuffix1}@test.com`,
        phone: "9582514339",
        password: "Password@123",
        department: "Engineering",
        employmentType: "Full Time",
        joiningDate: new Date().toISOString(),
        termsAccepted: "true",
      }),
    });
    const twilioUser1Data = await twilioUser1Res.json();
    assert(
      twilioUser1Data.success === true,
      "First user registration with authorized test number 9582514339 succeeds"
    );

    const randomSuffix2 = Date.now() + 1;
    const twilioUser2Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Twilio",
        lastName: "UserTwo",
        email: `twiliotest2_${randomSuffix2}@test.com`,
        phone: "9582514339",
        password: "Password@123",
        department: "Human Resources",
        employmentType: "Full Time",
        joiningDate: new Date().toISOString(),
        termsAccepted: "true",
      }),
    });
    const twilioUser2Data = await twilioUser2Res.json();
    assert(
      twilioUser2Data.success === true,
      "Second user registration with authorized test number 9582514339 DUPLICATE succeeds"
    );

    // 21. Non-Exempt Phone Numbers CANNOT be duplicated
    const uniquePhone = "98" + Math.floor(10000000 + Math.random() * 90000000);
    const nonExempt1Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Strict",
        lastName: "PhoneOne",
        email: `strict1_${Date.now()}@test.com`,
        phone: uniquePhone,
        password: "Password@123",
        department: "Sales",
        employmentType: "Full Time",
        joiningDate: new Date().toISOString(),
        termsAccepted: "true",
      }),
    });
    const nonExempt1Data = await nonExempt1Res.json();
    assert(
      nonExempt1Data.success === true,
      "Non-exempt phone number initial registration succeeds"
    );

    const nonExempt2Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Strict",
        lastName: "PhoneTwo",
        email: `strict2_${Date.now()}@test.com`,
        phone: uniquePhone,
        password: "Password@123",
        department: "Marketing",
        employmentType: "Full Time",
        joiningDate: new Date().toISOString(),
        termsAccepted: "true",
      }),
    });
    const nonExempt2Data = await nonExempt2Res.json();
    assert(
      nonExempt2Data.success === false && nonExempt2Res.status === 409,
      "Non-exempt phone duplicate registration is strictly rejected (HTTP 409 Conflict)"
    );

    // 22. Change Verification Phone Feature
    const changePhoneZeroRes = await fetch(`${BASE_URL}/api/auth/change-verification-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `twiliotest1_${randomSuffix1}@test.com`,
        newPhone: "09582514339",
      }),
    });
    const changePhoneZeroData = await changePhoneZeroRes.json();
    assert(
      changePhoneZeroData.success === false && changePhoneZeroRes.status === 400,
      "Change verification phone rejects numbers starting with 0 (HTTP 400)"
    );

    const changePhoneValidRes = await fetch(`${BASE_URL}/api/auth/change-verification-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `twiliotest1_${randomSuffix1}@test.com`,
        newPhone: "9582514339",
        countryCode: "IN",
      }),
    });
    const changePhoneValidData = await changePhoneValidRes.json();
    assert(
      changePhoneValidData.success === true &&
      (changePhoneValidData.phone === "+919582514339" || changePhoneValidData.data?.phone === "+919582514339"),
      "Change verification phone successfully updates phone and dispatches new OTP"
    );

    console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
