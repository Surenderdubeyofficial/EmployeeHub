import twilio from "twilio";

const COUNTRY_DIAL_CODES = {
  IN: "+91",
  US: "+1",
  GB: "+44",
  CA: "+1",
  AU: "+61",
  DE: "+49",
  FR: "+33",
  AE: "+971",
  SG: "+65",
  JP: "+81",
  CN: "+86",
  BR: "+55",
  ZA: "+27",
  NG: "+234",
  PK: "+92",
  BD: "+880",
  SA: "+966",
  NL: "+31",
  ES: "+34",
  IT: "+39",
  NZ: "+64",
  MY: "+60",
  ID: "+62",
  PH: "+63",
  IE: "+353",
};

export const normalizePhoneNumber = (phone = "", countryCode = "IN") => {
  const raw = String(phone || "").trim().replace(/[^\d+]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;

  const dialCode = COUNTRY_DIAL_CODES[String(countryCode || "IN").toUpperCase()] || "+91";
  const cleanDigits = raw.replace(/^0+/, "");
  if (cleanDigits.startsWith(dialCode.replace("+", "")) && cleanDigits.length > 10) {
    return `+${cleanDigits}`;
  }

  return `${dialCode}${cleanDigits}`;
};

export const isAllowedDuplicatePhone = (phone = "") => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, "");
  return digits.endsWith("9582514339");
};

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

  if (apiKeySid && apiKeySecret && accountSid) {
    return twilio(apiKeySid, apiKeySecret, { accountSid });
  }

  if (accountSid && authToken) {
    return twilio(accountSid, authToken);
  }

  return null;
};

export const sendMobileOtp = async ({ to, otp, countryCode = "IN" }) => {
  const client = getTwilioClient();
  const formattedTo = normalizePhoneNumber(to, countryCode);

  if (!formattedTo) {
    console.warn("[MOBILE OTP WARNING] Invalid destination phone number provided.");
    return;
  }

  // If Twilio Verify Service SID is provided, use Twilio Verify API
  if (client && process.env.TWILIO_VERIFY_SERVICE_SID) {
    try {
      console.log(`[TWILIO VERIFY] Triggering Verify service for ${formattedTo}...`);
      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: formattedTo,
          channel: "sms",
        });
      console.log(`[TWILIO VERIFY SENT] Verification code sent to ${formattedTo}`);
      return;
    } catch (err) {
      console.warn(`[TWILIO VERIFY WARNING] Verify service failed: ${err.message}. Falling back to standard message or local OTP.`);
    }
  }

  // Standard Twilio SMS if phone number or alphanumeric sender is set
  if (client && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedTo,
        body: `Your EmployeeHub mobile verification OTP is ${otp}. It expires in 10 minutes.`,
      });
      console.log(`[TWILIO SMS SENT] Successfully sent SMS to ${formattedTo}`);
      return;
    } catch (err) {
      console.error(`[TWILIO SMS ERROR] Failed to send SMS to ${formattedTo}:`, err.message);
    }
  }

  // Fallback dev log
  console.log(`[DEV MOBILE OTP] ${formattedTo}: ${otp}`);
};

export const checkMobileVerification = async ({ to, otp, userOtp, countryCode = "IN" }) => {
  // First check local DB OTP (fastest & handles fallback)
  if (userOtp && String(userOtp).trim() === String(otp).trim()) {
    return { success: true, method: "local_otp" };
  }

  const formattedTo = normalizePhoneNumber(to, countryCode);
  const client = getTwilioClient();

  if (client && process.env.TWILIO_VERIFY_SERVICE_SID && formattedTo) {
    try {
      console.log(`[TWILIO VERIFY CHECK] Checking code for ${formattedTo}...`);
      const check = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: formattedTo,
          code: String(otp).trim(),
        });

      if (check.status === "approved") {
        console.log(`[TWILIO VERIFY CHECK] Approved for ${formattedTo}`);
        return { success: true, method: "twilio_verify" };
      }
    } catch (err) {
      console.warn(`[TWILIO VERIFY CHECK ERROR] ${err.message}`);
    }
  }

  return { success: false, message: "Invalid mobile OTP" };
};
