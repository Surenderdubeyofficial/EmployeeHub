# EmployeeHub — Smart Employee Management & Task Tracking Platform

EmployeeHub is an enterprise-grade full-stack workforce and task management platform built with modern web technologies, scalable ES modules, robust Role-Based Access Control (RBAC), and clean software architecture.

---

## 🚀 Key Features

* **Authentication & Verification**:
  * Dual Email OTP & Mobile SMS OTP verification with countdown rate-limiting.
  * Bcrypt password hashing with high cost factor and strict password validation.
  * JWT (JSON Web Token) authorization with Bearer token header handling.
  * Forgot Password & Secure Token-Based Password Reset.
  * Google OAuth single sign-on integration.
  * Re-verification flow for existing incomplete registrations.

* **Role-Based Access Control (RBAC)**:
  * **Admin**:
    * Organization-level workforce statistics & real-time analytics.
    * Employee directory management: Add, edit, deactivate, and delete employees.
    * Task delegation, assignment, priority controls, and deadlines.
    * Daily attendance logging and workforce overview.
  * **Employee**:
    * Personal workday dashboard with assigned tasks.
    * 1-Click Self-Service Check-In and Check-Out.
    * Task status progression (`Pending` ➔ `In Progress` ➔ `Completed`).
    * Personal profile management, skills editor, and secure password changes.

* **Workforce & Document Management**:
  * Multer-powered secure file uploads for profile photos (JPG, PNG, WEBP; max 2 MB) and supporting documents (PDF, JPG, PNG; max 5 MB).
  * Professional international phone input with country selector and ISO flags.
  * Multi-skill tag manager with custom skill addition.

* **Production-Oriented Code Quality**:
  * Unified RESTful API architecture with standardized response format (`sendSuccess`, `sendError`).
  * Async error handling middleware and Mongoose schema validation.
  * Fully componentized frontend with responsive mobile navigation drawers.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **State Management**: React Context (`AuthContext` + custom `useAuth` hook)
* **Components**: Custom UI System (`Button`, `Card`, `Modal`, `Loader`, `PhoneInput`, `EmployeeTable`, `TaskCard`)
* **Flag & Phone Support**: `country-flag-icons`, `react-phone-number-input`

### Backend
* **Runtime**: [Node.js](https://nodejs.org/) (ES Modules `import/export`)
* **Web Framework**: [Express.js](https://expressjs.com/)
* **Database & ORM**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
* **Security & Auth**: `jsonwebtoken`, `bcryptjs`, `crypto`
* **File Uploads**: `multer`
* **Email & SMS Services**: `nodemailer`, `twilio`

---

## 📁 Architecture & Folder Structure

```text
emploeemanagmentsystem-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, OTP, forgot/reset password
│   │   │   ├── employeeController.js   # Employee CRUD & status management
│   │   │   ├── taskController.js       # Task CRUD, assignment & status updates
│   │   │   ├── attendanceController.js # Check-in, check-out & attendance logs
│   │   │   └── dashboardController.js  # Analytics for Admin and Employee
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT extraction & verification
│   │   │   ├── roleMiddleware.js       # Role-Based Access Control guards
│   │   │   ├── errorMiddleware.js      # Global error and 404 handler
│   │   │   └── uploadMiddleware.js     # Multer file storage & MIME validation
│   │   ├── models/
│   │   │   ├── User.js                 # User schema, bcrypt pre-save, indexes
│   │   │   ├── Task.js                 # Task schema with priority & status enums
│   │   │   └── Attendance.js           # Daily attendance with checkIn/checkOut
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/
│   │   │   ├── emailService.js         # Nodemailer OTP & password reset emails
│   │   │   ├── smsService.js           # Twilio SMS OTP integration
│   │   │   └── googleAuthService.js    # Google token identity verification
│   │   ├── utils/
│   │   │   ├── seed.js                 # Database seeder for demo data
│   │   │   ├── testApi.js              # Automated end-to-end API test suite
│   │   │   ├── apiResponse.js          # Standardized response envelopes
│   │   │   ├── asyncHandler.js         # Async wrapper for controllers
│   │   │   ├── generateOtp.js          # Cryptographic 6-digit OTP generator
│   │   │   └── generateToken.js        # Signed JWT generator
│   │   └── server.js                   # Express app entry point
│   ├── uploads/
│   │   ├── profiles/
│   │   └── documents/
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.js               # Root layout with AuthProvider
    │   │   ├── page.js                 # Landing page with hero, features, CTA
    │   │   ├── login/                  # Login page
    │   │   ├── register/               # Multi-section employee registration
    │   │   ├── verify-otp/             # Dual Email & SMS OTP verification
    │   │   ├── forgot-password/        # Password reset request
    │   │   ├── reset-password/         # Token-based password update
    │   │   ├── dashboard/              # Role-aware dashboard (Admin / Employee)
    │   │   ├── employees/              # Employee directory with search/filters
    │   │   │   ├── add/                # Add employee form
    │   │   │   └── [id]/               # Comprehensive employee detail view
    │   │   ├── tasks/                  # Task board with status toggles & modals
    │   │   ├── attendance/             # Attendance check-in/out & history
    │   │   ├── profile/                # Profile view and inline editor
    │   │   └── settings/               # Password change & notifications toggle
    │   ├── components/
    │   │   ├── layout/                 # DashboardLayout, Sidebar, Navbar
    │   │   ├── ui/                     # Button, Card, Modal, Loader, PhoneInput
    │   │   ├── auth/                   # RegisterForm, LoginForm, OTPForm, sections
    │   │   ├── employees/              # EmployeeTable, EmployeeCard, EmployeeForm
    │   │   └── tasks/                  # TaskCard, TaskForm
    │   ├── context/                    # AuthContext and AuthProvider
    │   ├── hooks/                      # useAuth hook
    │   └── lib/                        # Centralized API client & utility helpers
    ├── .env.local
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* **Node.js**: v18+ (tested on Node v22)
* **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/employeehub
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

#### Seed Demo Data:
Run the seed script to create test accounts, tasks, and attendance:
```bash
npm run seed
```

#### Run Automated Test Suite:
```bash
npm run test:api
```

#### Start Backend Server:
```bash
npm run dev
# or
npm start
```
The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Configure `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Start Frontend:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@employeehub.com` | `Password@123` | Full control over employees, tasks, attendance, settings |
| **Employee (Dev)** | `aisha@employeehub.com` | `Password@123` | Assigned tasks, self check-in/out, profile editing |
| **Employee (HR)** | `rahul@employeehub.com` | `Password@123` | HR tasks, attendance logging, personal settings |
| **Employee (Finance)** | `priya@employeehub.com` | `Password@123` | Finance work items, attendance records, profile |

---

## 🌐 API Reference

### Authentication
* `POST /api/auth/register` — Multipart form registration with profile photo and documents.
* `POST /api/auth/login` — Authenticate and receive JWT.
* `POST /api/auth/google` — Google OAuth credential login / creation.
* `POST /api/auth/verify-email-otp` — Verify email 6-digit OTP.
* `POST /api/auth/verify-mobile-otp` — Verify mobile 6-digit OTP.
* `POST /api/auth/resend-email-otp` — Request new email OTP.
* `POST /api/auth/resend-mobile-otp` — Request new mobile OTP.
* `POST /api/auth/forgot-password` — Request password reset email.
* `POST /api/auth/reset-password` — Reset password using token.
* `GET  /api/auth/me` — Get current authenticated user profile *(Protected)*.
* `PUT  /api/auth/profile` — Update allowed personal profile fields *(Protected)*.
* `PUT  /api/auth/change-password` — Change password verifying current password *(Protected)*.

### Employees *(Admin Only)*
* `GET    /api/employees` — Search, filter by department & status.
* `GET    /api/employees/:id` — Get full employee details with tasks & documents.
* `POST   /api/employees` — Add employee record directly.
* `PUT    /api/employees/:id` — Update employee details.
* `DELETE /api/employees/:id` — Delete employee record.
* `PATCH  /api/employees/:id/status` — Toggle status (`active`, `on-leave`, `inactive`).

### Tasks
* `GET    /api/tasks` — List tasks (Admin: all tasks; Employee: assigned tasks).
* `GET    /api/tasks/my` — List employee's assigned tasks.
* `GET    /api/tasks/:id` — Get task by ID.
* `POST   /api/tasks` — Create task *(Admin)*.
* `PUT    /api/tasks/:id` — Edit task *(Admin)*.
* `DELETE /api/tasks/:id` — Delete task *(Admin)*.
* `PATCH  /api/tasks/:id/status` — Update status (`Pending`, `In Progress`, `Completed`, `Cancelled`).

### Attendance
* `GET  /api/attendance` — Fetch attendance records (Admin: all with date/employee filter; Employee: own records).
* `GET  /api/attendance/today` — Get current user's today status.
* `POST /api/attendance/check-in` — 1-Click check-in timestamp.
* `POST /api/attendance/check-out` — 1-Click check-out timestamp.
* `POST /api/attendance` — Admin mark employee attendance *(Admin)*.
* `PUT  /api/attendance/:id` — Admin update attendance record *(Admin)*.

### Dashboard Analytics
* `GET /api/dashboard/stats` — Metrics for Admin (headcount, attendance rate, tasks distribution) or Employee (my tasks, today's attendance, deadlines).

---

## 🔒 Security Highlights

1. **Password Hashing**: `bcryptjs` with salt round 12. Plain passwords are never saved.
2. **Timing-Safe Error Responses**: Password reset responses do not leak account existence.
3. **MIME & File Validation**: Multer storage inspects allowed extensions and limits profile photos to 2 MB and documents to 5 MB.
4. **RBAC Enforcement**: Server-side middleware protects sensitive routes, blocking unauthorized escalation attempts (e.g. employees calling employee creation endpoints).
5. **Clean Environment Secrets**: Secret keys, database URIs, and provider credentials are kept in `.env` files and excluded from git.
