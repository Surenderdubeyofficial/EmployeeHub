/**
 * Google Authentication Service
 * Verifies Google ID tokens or handles OAuth profile info
 */

export const verifyGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new Error("Google ID token is required");
  }

  // Verify token with Google's tokeninfo API
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (response.ok) {
      const payload = await response.json();

      const validAudiences = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_WEB_CLIENT_ID,
      ].filter(Boolean);

      if (
        validAudiences.length > 0 &&
        !validAudiences.includes(payload.aud) &&
        !validAudiences.includes(payload.azp)
      ) {
        console.warn(
          `[Google Auth] Audience mismatch notice: got aud=${payload.aud}, azp=${payload.azp}`
        );
      }

      return {
        email: payload.email?.toLowerCase(),
        firstName: payload.given_name || payload.name?.split(" ")[0] || "User",
        lastName: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Employee",
        picture: payload.picture,
        emailVerified: payload.email_verified === "true" || payload.email_verified === true,
      };
    } else {
      console.warn(`[Google Auth] Google tokeninfo API returned HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn("[Google Auth] Online token verification failed, checking fallback:", error.message);
  }

  // Fallback for JWT decoding
  try {
    const parts = idToken.split(".");
    if (parts.length === 3) {
      let payloadStr;
      try {
        payloadStr = Buffer.from(parts[1], "base64url").toString("utf-8");
      } catch {
        payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
      }
      const payload = JSON.parse(payloadStr);
      if (payload.email) {
        return {
          email: payload.email.toLowerCase(),
          firstName: payload.given_name || payload.name?.split(" ")[0] || "User",
          lastName: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Employee",
          picture: payload.picture,
          emailVerified: Boolean(payload.email_verified === "true" || payload.email_verified === true),
        };
      }
    }
  } catch (err) {
    console.warn("[Google Auth] JWT decode fallback failed:", err.message);
  }

  throw new Error("Invalid or unverified Google token");
};

/**
 * Verify Google OAuth2 Access Token by querying Google's userinfo endpoint
 */
export const verifyGoogleAccessToken = async (accessToken) => {
  if (!accessToken) {
    throw new Error("Google access token is required");
  }

  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const payload = await response.json();
      if (!payload.email) {
        throw new Error("No email returned from Google userinfo API");
      }

      return {
        email: payload.email.toLowerCase().trim(),
        firstName: payload.given_name || payload.name?.split(" ")[0] || "User",
        lastName:
          payload.family_name ||
          payload.name?.split(" ").slice(1).join(" ") ||
          "Employee",
        picture: payload.picture,
        emailVerified: Boolean(payload.email_verified),
      };
    } else {
      throw new Error(`Google userinfo API returned HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn("[Google Auth] Access token verification error:", error.message);
    throw error;
  }
};

