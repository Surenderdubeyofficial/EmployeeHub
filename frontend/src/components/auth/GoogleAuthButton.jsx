"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "746086572693-6jvl4jqqibj78i25vonc20gqk98n82os.apps.googleusercontent.com";

export default function GoogleAuthButton({
  mode = "signin", // "signin" | "signup"
  onError = null,
  redirectUrl = "/dashboard",
  className = "",
}) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDevFallback, setShowDevFallback] = useState(false);
  const tokenClientRef = useRef(null);

  // Helper to ensure Google script is fully loaded
  const waitForGoogleScript = useCallback((timeoutMs = 3000) => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);

      if (window.google?.accounts?.oauth2) {
        return resolve(true);
      }

      // Check if script tag is already in DOM
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          resolve(Boolean(window.google?.accounts?.oauth2));
        }
      }, 50);
    });
  }, []);

  // Preload and initialize token client on mount
  useEffect(() => {
    let isMounted = true;
    waitForGoogleScript().then((ready) => {
      if (!isMounted || !ready) return;
      try {
        if (window.google?.accounts?.oauth2 && !tokenClientRef.current) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "openid profile email",
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.warn("[Google Auth] Response error:", tokenResponse.error);
                if (tokenResponse.error !== "popup_closed_by_user") {
                  setErrorMessage(
                    tokenResponse.error_description ||
                      "Google authorization was cancelled or failed."
                  );
                }
                setLoading(false);
                return;
              }

              if (tokenResponse.access_token) {
                setLoadingText("Verifying Google account...");
                try {
                  // Fetch profile details directly from Google userinfo API
                  let profile = null;
                  try {
                    const infoRes = await fetch(
                      "https://www.googleapis.com/oauth2/v3/userinfo",
                      {
                        headers: {
                          Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                      }
                    );
                    if (infoRes.ok) {
                      profile = await infoRes.json();
                    }
                  } catch (fetchErr) {
                    console.warn("[Google Auth] Userinfo fetch warning:", fetchErr);
                  }

                  await loginWithGoogle({
                    accessToken: tokenResponse.access_token,
                    profile,
                  });

                  router.push(redirectUrl);
                } catch (err) {
                  console.error("[Google Auth] Backend login error:", err);
                  const msg =
                    err.message ||
                    "Google authentication failed. Please check credentials or try again.";
                  setErrorMessage(msg);
                  if (onError) onError(msg);
                  setLoading(false);
                }
              }
            },
            error_callback: (error) => {
              console.warn("[Google Auth] OAuth popup error:", error);
              setLoading(false);
              if (error?.type === "popup_closed") {
                return;
              }
              const msg =
                error?.message ||
                "Unable to open Google Sign-In popup. Please allow popups or use dev mode.";
              setErrorMessage(msg);
              setShowDevFallback(true);
              if (onError) onError(msg);
            },
          });
        }
      } catch (err) {
        console.warn("[Google Auth] Init error:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [waitForGoogleScript, loginWithGoogle, redirectUrl, router, onError]);

  // Click handler to launch authentic Google account chooser popup
  const handleGoogleClick = async () => {
    setLoading(true);
    setLoadingText("Connecting with Google...");
    setErrorMessage("");

    try {
      const ready = await waitForGoogleScript(2500);

      if (!ready || !window.google?.accounts?.oauth2) {
        // If Google script cannot be loaded (e.g. offline or adblocker)
        setShowDevFallback(true);
        setErrorMessage(
          "Google Sign-In service is taking longer than usual or is blocked by an extension. You can use Dev SSO or retry."
        );
        setLoading(false);
        return;
      }

      // If token client is not initialized yet, initialize it
      if (!tokenClientRef.current) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid profile email",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== "popup_closed_by_user") {
                setErrorMessage(
                  tokenResponse.error_description ||
                    "Google sign-in was cancelled or failed."
                );
              }
              setLoading(false);
              return;
            }

            if (tokenResponse.access_token) {
              setLoadingText("Verifying Google account...");
              try {
                let profile = null;
                try {
                  const infoRes = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                      headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                      },
                    }
                  );
                  if (infoRes.ok) {
                    profile = await infoRes.json();
                  }
                } catch (fetchErr) {
                  console.warn("[Google Auth] Userinfo fetch notice:", fetchErr);
                }

                await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  profile,
                });

                router.push(redirectUrl);
              } catch (err) {
                const msg =
                  err.message ||
                  "Google authentication failed. Please try again.";
                setErrorMessage(msg);
                if (onError) onError(msg);
                setLoading(false);
              }
            }
          },
          error_callback: (error) => {
            console.warn("[Google Auth] OAuth error:", error);
            setLoading(false);
            if (error?.type !== "popup_closed") {
              setErrorMessage(
                error?.message ||
                  "Google popup was blocked or origin is unconfigured. Try Dev SSO."
              );
              setShowDevFallback(true);
            }
          },
        });
      }

      // Request authentic Google OAuth Popup
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      console.error("[Google Auth] Unexpected click handler error:", err);
      setErrorMessage(
        "Could not launch Google Sign-In. You can sign in with password or use Dev SSO."
      );
      setShowDevFallback(true);
      setLoading(false);
    }
  };

  // Dedicated developer demo SSO flow (for localhost testing & verification)
  const handleDevDemoAuth = async () => {
    setLoading(true);
    setLoadingText("Signing in with test Google profile...");
    setErrorMessage("");

    try {
      const demoPayload = {
        email: "google.employee@company.com",
        firstName: "Google",
        lastName: "Employee",
        name: "Google Employee",
        picture:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      };

      await loginWithGoogle({ profile: demoPayload });
      router.push(redirectUrl);
    } catch (err) {
      const msg = err.message || "Dev authentication failed.";
      setErrorMessage(msg);
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center gap-2.5 ${className}`}>
      {errorMessage && (
        <div className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold shrink-0">⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-400 hover:text-red-700 font-bold ml-1 p-0.5"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Primary Custom Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-slate-600 text-xs font-medium">
              {loadingText || "Connecting..."}
            </span>
          </>
        ) : (
          <>
            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === "signup"
                ? "Sign up with Google"
                : "Continue with Google"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
