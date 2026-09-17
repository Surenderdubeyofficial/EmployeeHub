import nodemailer from "nodemailer";

const getEmailConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.EMAIL_SECURE === "true" ||
    port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, user, pass, secure };
};

const createTransporter = () => {
  const config = getEmailConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

const isDummyEmail = (email = "") => {
  const dummyDomains = [
    "employeehub.com",
    "employeehub.dev",
    "example.com",
    "company.com",
    "test.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return dummyDomains.includes(domain);
};

export const sendEmailOtp = async ({ to, otp }) => {
  const config = getEmailConfig();

  // If dummy test account, log locally to avoid 550 address not found bounces
  if (isDummyEmail(to)) {
    console.log(
      `[DEMO ACCOUNT] Simulated OTP for ${to}: ${otp} (Skipping real SMTP to avoid bounce)`
    );
    return;
  }

  if (!config) {
    console.log(`[DEV EMAIL OTP] ${to}: ${otp}`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `EmployeeHub <${config.user}>`,
      to,
      subject: "EmployeeHub Email Verification OTP",
      text: `Your EmployeeHub email verification OTP is: ${otp}\n\nThis OTP expires in 10 minutes.\n\nThank you for choosing EmployeeHub.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 14px;">Thank you for registering with EmployeeHub. Please enter the following 6-digit verification code:</p>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`[EMAIL OTP SENT] Successfully sent OTP to ${to}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email OTP to ${to}:`, error.message);
    // Fallback log for development/testing
    console.log(`[FALLBACK EMAIL OTP] ${to}: ${otp}`);
  }
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const config = getEmailConfig();

  // If dummy test account, log locally to avoid 550 address not found bounces
  if (isDummyEmail(to)) {
    console.log(
      `[DEMO ACCOUNT] Simulated Password Reset for ${to}: ${resetUrl} (Skipping real SMTP to avoid bounce)`
    );
    return;
  }

  if (!config) {
    console.log(`[DEV PASSWORD RESET] ${to}: ${resetUrl}`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `EmployeeHub <${config.user}>`,
      to,
      subject: "EmployeeHub Password Reset Request",
      text: `You requested a password reset for your EmployeeHub account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px;">We received a request to reset your password for your EmployeeHub account. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a></p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[PASSWORD RESET EMAIL SENT] Sent reset link to ${to}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send password reset email to ${to}:`, error.message);
    console.log(`[FALLBACK PASSWORD RESET] ${to}: ${resetUrl}`);
  }
};
