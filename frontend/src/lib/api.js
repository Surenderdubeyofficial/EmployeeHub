/**
 * EmployeeHub Centralized API Client
 * Automatically manages Authorization headers, JSON/FormData payloads, and error normalization.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const buildHeaders = (customHeaders = {}, isFormData = false) => {
  const headers = { ...customHeaders };
  const token = getAuthToken();

  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: response.statusText || "Server error" };
  }

  if (!response.ok) {
    // If unauthorized / token expired, clear invalid auth state
    if (response.status === 401 && typeof window !== "undefined") {
      // Don't auto-redirect if checking auth on login/register endpoints
      const isAuthEndpoint =
        response.url?.includes("/login") ||
        response.url?.includes("/register") ||
        response.url?.includes("/verify-");

      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    const message =
      data.message ||
      (Array.isArray(data.errors) ? data.errors.join(", ") : "Request failed");

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data && typeof data === "object" && data.data === undefined) {
    data.data = data;
  }

  return data;
};

export const api = {
  baseUrl: API_BASE_URL,

  async get(endpoint, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(headers),
    });

    return handleResponse(response);
  },

  async post(endpoint, body = {}, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async put(endpoint, body = {}, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async patch(endpoint, body = {}, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async delete(endpoint, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(headers),
    });

    return handleResponse(response);
  },

  async postForm(endpoint, formData, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(headers, true),
      body: formData,
    });

    return handleResponse(response);
  },

  async putForm(endpoint, formData, headers = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(headers, true),
      body: formData,
    });

    return handleResponse(response);
  },
};

export default api;
