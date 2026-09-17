/**
 * Authentication helper utilities
 */

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (token, user) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  return Boolean(getStoredToken() && getStoredUser());
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === "admin";
};
