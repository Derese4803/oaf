"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const STATUS_STYLES = {
  PRESENT: "bg-forest-700/10 text-forest-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-500/15 text-amber-600",
  LEAVE: "bg-blue-100 text-blue-700",
};

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    status: "PRESENT",
    notes: "",
  });

  function load() {
    api.getAttendance().then(setAttendanceRecords).catch((e) => setError(e.message));
    api.getUsers().then(setUsers).catch(() => {});
  }

  useEffect(() => {
    setIsMounted(true);
    load();
  }, []);

  // Prevent execution on server during static build / prerendering
  if (!isMounted) {
    return null;
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleMark(e) {
    e.preventDefault();
    setError("");
    try {
      await api.markAttendance(form);
      setForm({ userId: "", status: "PRESENT", notes: "" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-wheat-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Attendance" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form
              onSubmit={handleMark}
              className="bg-white rounded-xl border border-forest-800/10 p-5 mb-8 max-w-xl"
            >
              <h2 className="font-display text-lg text-forest-950 mb-3">
                Log attendance
              </h2>
              <div className="space-y-3">
                <select
                  className="w-full px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.userId}
                  onChange={(e) => updateForm("userId", e.target.value)}
                  required
                >
                  <option value="">Select staff member…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>

                <select
                  className="w-full px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">On Leave</option>
                </select>

                <input
                  className="w-full px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Notes / reason (optional)"
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                />
              </div>

              <button className="mt-4 px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Save log
              </button>
            </form>

            <div className="bg-white rounded-xl border border-forest-800/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-wheat-100 text-left text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((a) => (
                    <tr key={a.id} className="border-t border-forest-800/5">
                      <td className="px-4 py-3 text-forest-950 font-medium">
                        {a.user?.fullName || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString()
                          : "Today"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            STATUS_STYLES[a.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceRecords.length === 0 && (
                <p className="p-4 text-slate-600">No attendance records logged yet.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}