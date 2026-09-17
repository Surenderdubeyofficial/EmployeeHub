"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from "../lib/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on client mount
  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);

      // Verify token with backend
      api
        .get("/api/auth/me")
        .then((res) => {
          const fetchedUser = res?.user || res?.data?.user;
          if (fetchedUser) {
            setUser(fetchedUser);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
          }
        })
        .catch(() => {
          // Token invalid or expired
          clearStoredAuth();
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });

    const requiresVerification =
      response?.requiresVerification ||
      response?.data?.requiresVerification;
    const userObj = response?.user || response?.data?.user;
    const tokenStr = response?.token || response?.data?.token;

    if (requiresVerification) {
      return {
        ...response,
        requiresVerification: true,
        user: userObj,
      };
    }

    if (tokenStr && userObj) {
      setStoredAuth(tokenStr, userObj);
      setToken(tokenStr);
      setUser(userObj);
    }

    return {
      ...response,
      token: tokenStr,
      user: userObj,
    };
  };

  const loginWithGoogle = async (credentialOrPayload) => {
    const payload =
      typeof credentialOrPayload === "string"
        ? { credential: credentialOrPayload }
        : credentialOrPayload;
    const response = await api.post("/api/auth/google", payload);

    const userObj = response?.user || response?.data?.user;
    const tokenStr = response?.token || response?.data?.token;

    if (tokenStr && userObj) {
      setStoredAuth(tokenStr, userObj);
      setToken(tokenStr);
      setUser(userObj);
    }

    return {
      ...response,
      token: tokenStr,
      user: userObj,
    };
  };

  const register = async (formData) => {
    return api.postForm("/api/auth/register", formData);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    router.replace("/login");
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem("user", JSON.stringify(merged));
  };

  const loginWithToken = (tokenStr, userObj) => {
    if (tokenStr && userObj) {
      setStoredAuth(tokenStr, userObj);
      setToken(tokenStr);
      setUser(userObj);
    }
  };

  const userRole = (user?.role || "employee").toLowerCase();
  const isAdmin = userRole === "admin";
  const isCeo = userRole === "ceo";
  const isHr = userRole === "hr";
  const isManager = userRole === "manager";
  const isEmployee = !user?.role || userRole === "employee";
  const canManageEmployees = isAdmin || isHr || isCeo;
  const canManageTasks = isAdmin || isManager || isCeo;
  const canManageAttendance = isAdmin || isHr;

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    role: userRole,
    isAdmin,
    isCeo,
    isHr,
    isManager,
    isEmployee,
    canManageEmployees,
    canManageTasks,
    canManageAttendance,
    login,
    loginWithToken,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
