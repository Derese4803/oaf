cat << 'EOF' > github-repo/org-system/frontend/lib/auth.js
export function saveSession(token, user) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem("token", token);
    if (user) {
      const userVal = typeof user === "string" ? user : JSON.stringify(user);
      localStorage.setItem("user", userVal);
    }
  } catch (error) {
    console.error("Error saving session to localStorage:", error);
  }
}

export function getSession() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  try {
    const token = localStorage.getItem("token") || null;
    const userRaw = localStorage.getItem("user");
    let user = null;
    if (userRaw) {
      user = JSON.parse(userRaw);
    }
    return { token, user };
  } catch (error) {
    console.error("Error reading session from localStorage:", error);
    return { token: null, user: null };
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingUser");
  } catch (error) {
    console.error("Error clearing session from localStorage:", error);
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
EOF