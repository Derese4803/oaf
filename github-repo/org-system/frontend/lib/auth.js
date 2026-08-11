"use client";

export function saveSession(token, user) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function getSession() {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    return { token, user: userRaw ? JSON.parse(userRaw) : null };
  } catch (error) {
    return { token: null, user: null };
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  DEPT_ADMIN: "Department Admin",
  MANAGER: "Manager",
  FIELD_MANAGER: "Field Manager",
  SUPERVISOR: "Supervisor",
  ENUMERATOR: "Enumerator",
};