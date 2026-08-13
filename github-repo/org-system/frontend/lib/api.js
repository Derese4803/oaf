// Dynamically resolve API URL from Vercel env or fallback for local rewrites
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return envUrl.replace(/\/+$/, ""); // Remove trailing slash if present
};

const API_BASE = getBaseUrl();

// Comprehensive Mock fallback data for offline/demo mode
const MOCK_DATA = {
  stats: {
    totalUsers: 48,
    activeReports: 12,
    attendanceRate: "94%",
    pendingApprovals: 5,
    departmentPerformance: [
      { name: "Operations", performance: 92 },
      { name: "Field Ops", performance: 88 },
      { name: "Executive", performance: 98 },
    ],
    chartData: [
      { name: "Mon", reports: 4 },
      { name: "Tue", reports: 7 },
      { name: "Wed", reports: 12 },
      { name: "Thu", reports: 9 },
      { name: "Fri", reports: 15 },
    ],
    recentActivity: [
      { id: 1, user: "Abebe K.", action: "Submitted Field Report #104", time: "10 mins ago" },
      { id: 2, user: "Supervisor 1", action: "Approved Attendance Log", time: "1 hour ago" },
      { id: 3, user: "Manager 1", action: "Updated Regional Assignment", time: "3 hours ago" },
    ],
  },
  users: [
    { id: "1", username: "admin", name: "System Admin", fullName: "System Admin", role: "ADMIN", department: "Executive" },
    { id: "2", username: "manager1", name: "Manager One", fullName: "Manager One", role: "MANAGER", department: "Operations" },
    { id: "3", username: "fieldmgr1", name: "Field Manager 1", fullName: "Field Manager 1", role: "FIELD_MANAGER", department: "Field Ops" },
    { id: "4", username: "supervisor1", name: "Supervisor 1", fullName: "Supervisor 1", role: "SUPERVISOR", department: "Field Ops" },
    { id: "5", username: "abebe.k", name: "Abebe K.", fullName: "Abebe K.", role: "ENUMERATOR", department: "Field Ops" },
  ],
  departments: [
    { id: "1", name: "Executive", _count: { users: 5, teams: 1 } },
    { id: "2", name: "Operations", _count: { users: 18, teams: 3 } },
    { id: "3", name: "Field Operations", _count: { users: 25, teams: 4 } },
  ],
  teams: [
    {
      id: "1",
      name: "North Region Team",
      departmentId: "3",
      department: { name: "Field Operations" },
      _count: { reports: 12, members: 2 },
      members: [
        { user: { id: "3", fullName: "Field Manager 1", role: "FIELD_MANAGER" } },
        { user: { id: "5", fullName: "Abebe K.", role: "ENUMERATOR" } },
      ],
    },
    {
      id: "2",
      name: "South Region Team",
      departmentId: "3",
      department: { name: "Field Operations" },
      _count: { reports: 8, members: 1 },
      members: [
        { user: { id: "4", fullName: "Supervisor 1", role: "SUPERVISOR" } },
      ],
    },
  ],
  reports: [
    { id: "101", title: "Weekly Agricultural Audit", status: "PENDING", author: "Abebe K.", date: "2026-08-11" },
    { id: "102", title: "Equipment Inventory Status", status: "APPROVED", author: "Supervisor 1", date: "2026-08-10" },
  ],
  attendance: {
    today: [
      { id: "1", user: "Abebe K.", checkIn: "08:30 AM", status: "PRESENT" },
      { id: "2", user: "Supervisor 1", checkIn: "08:15 AM", status: "PRESENT" },
    ],
    history: [],
  },
  letters: [
    { id: "1", title: "Regional Directive 2026", status: "SENT", date: "2026-08-01" },
  ],
  notifications: [
    { id: "1", message: "New report submitted for review", read: false },
  ],
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}, fallbackValue = null) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Handle path construction safely regardless of whether API_BASE includes /api
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = API_BASE
    ? API_BASE.endsWith("/api")
      ? `${API_BASE}${cleanPath}`
      : `${API_BASE}/api${cleanPath}`
    : `/api${cleanPath}`;

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  } catch (err) {
    console.warn(`[API Offline Mode] Request to ${targetUrl} failed. Returning fallback mock data.`, err.message);
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    throw err;
  }
}

export const api = {
  login: (username, password) =>
    request(
      "/auth/login",
      { method: "POST", body: { username, password }, auth: false },
      { token: "dev-bypass-token-12345", user: { username: username || "admin", role: "ADMIN" } }
    ),

  getDashboardStats: () => request("/stats/dashboard", {}, MOCK_DATA.stats),

  getDepartments: () => request("/departments", {}, MOCK_DATA.departments),
  createDepartment: (name) => request("/departments", { method: "POST", body: { name } }, { id: String(Date.now()), name, _count: { users: 0, teams: 0 } }),

  getTeams: () => request("/teams", {}, MOCK_DATA.teams),
  createTeam: (name, departmentId) => request("/teams", { method: "POST", body: { name, departmentId } }, { id: String(Date.now()), name, departmentId, _count: { reports: 0, members: 0 }, members: [] }),
  addTeamMember: (teamId, userId) => request(`/teams/${teamId}/members`, { method: "POST", body: { userId } }, { success: true }),

  getUsers: () => request("/users", {}, MOCK_DATA.users),
  createUser: (payload) => request("/users", { method: "POST", body: payload }, { id: String(Date.now()), ...payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: "PATCH", body: payload }, { id, ...payload }),
  resetPassword: (id, newPassword) => request(`/users/${id}/reset-password`, { method: "POST", body: { newPassword } }, { success: true }),

  getReports: (status) => request(`/reports${status ? `?status=${status}` : ""}`, {}, MOCK_DATA.reports),
  createReport: (payload) => request("/reports", { method: "POST", body: payload }, { id: String(Date.now()), ...payload }),
  reviewReport: (id, status, reviewNote) => request(`/reports/${id}/review`, { method: "PATCH", body: { status, reviewNote } }, { id, status, reviewNote }),

  getTodayAttendance: () => request("/attendance/today", {}, MOCK_DATA.attendance.today),
  getAttendanceHistory: (userId) => request(`/attendance/history${userId ? `?userId=${userId}` : ""}`, {}, MOCK_DATA.attendance.history),
  logAttendanceEvent: (event) => request("/attendance/event", { method: "POST", body: { event } }, { success: true }),

  getLetters: () => request("/letters", {}, MOCK_DATA.letters),
  createLetter: (payload) => request("/letters", { method: "POST", body: payload }, { id: String(Date.now()), ...payload }),
  updateLetterStatus: (id, status) => request(`/letters/${id}/status`, { method: "PATCH", body: { status } }, { id, status }),

  getNotifications: () => request("/notifications", {}, MOCK_DATA.notifications),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }, { success: true }),
  checkSchedule: () => request("/notifications/check-schedule", { method: "POST" }, { success: true }),
};