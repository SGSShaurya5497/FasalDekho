// Auth API service and token helper
import API_BASE from "./api";
const API_URL = API_BASE;

export const getStoredToken = () => {
  return localStorage.getItem("fd_access_token");
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("fd_access_token", token);
  } else {
    localStorage.removeItem("fd_access_token");
  }
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem("fd_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem("fd_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("fd_user");
  }
};

export const signupUser = async (email, password, fullName) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true"
    },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Signup failed. Email might already exist.");
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true"
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password.");
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
};

export const logoutUser = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, { 
      method: "POST",
      headers: {
        "bypass-tunnel-reminder": "true"
      }
    });
  } catch (e) {
    // Ignore network error on logout
  }
  setStoredToken(null);
  setStoredUser(null);
};

export const fetchCurrentUser = async () => {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "bypass-tunnel-reminder": "true"
    },
  });
  if (!res.ok) {
    setStoredToken(null);
    setStoredUser(null);
    return null;
  }
  const user = await res.json();
  setStoredUser(user);
  return user;
};

