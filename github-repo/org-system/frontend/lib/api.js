const API_BASE = ""; // rewrites proxy /api/* to the backend in dev

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password }, auth: false }),

  getDashboardStats: () => request("/stats/dashboard"),

  getDepartments: () => request("/departments"),
  createDepartment: (name) => request("/departments", { method: "POST", body: { name } }),

  getTeams: () => request("/teams"),
  createTeam: (name, departmentId) => request("/teams", { method: "POST", body: { name, departmentId } }),
  addTeamMember: (teamId, userId) => request(`/teams/${teamId}/members`, { method: "POST", body: { userId } }),

  getUsers: () => request("/users"),
  createUser: (payload) => request("/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: "PATCH", body: payload }),
  resetPassword: (id, newPassword) => request(`/users/${id}/reset-password`, { method: "POST", body: { newPassword } }),

  getReports: (status) => request(`/reports${status ? `?status=${status}` : ""}`),
  createReport: (payload) => request("/reports", { method: "POST", body: payload }),
  reviewReport: (id, status, reviewNote) => request(`/reports/${id}/review`, { method: "PATCH", body: { status, reviewNote } }),

  getTodayAttendance: () => request("/attendance/today"),
  getAttendanceHistory: (userId) => request(`/attendance/history${userId ? `?userId=${userId}` : ""}`),
  logAttendanceEvent: (event) => request("/attendance/event", { method: "POST", body: { event } }),

  getLetters: () => request("/letters"),
  createLetter: (payload) => request("/letters", { method: "POST", body: payload }),
  updateLetterStatus: (id, status) => request(`/letters/${id}/status`, { method: "PATCH", body: { status } }),

  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  checkSchedule: () => request("/notifications/check-schedule", { method: "POST" }),
};
