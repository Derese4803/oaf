"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    departmentsCount: 0,
    teamsCount: 0,
    lettersCount: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  function load() {
    // Fetch overview statistics and recent logs
    Promise.all([
      api.getUsers().catch(() => []),
      api.getDepartments().catch(() => []),
      api.getTeams().catch(() => []),
      api.getLetters().catch(() => []),
      api.getAttendance().catch(() => []),
    ])
      .then(([users, departments, teams, letters, attendance]) => {
        setStats({
          usersCount: users?.length || 0,
          departmentsCount: departments?.length || 0,
          teamsCount: teams?.length || 0,
          lettersCount: letters?.length || 0,
        });
        setRecentAttendance((attendance || []).slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    setIsMounted(true);
    load();
  }, []);

  // Guard against hydration errors during Next.js static export / SSR
  if (!isMounted) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-wheat-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Dashboard Overview" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-forest-800/10 p-5">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Total Staff
                </p>
                <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                  {stats.usersCount}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-forest-800/10 p-5">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Departments
                </p>
                <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                  {stats.departmentsCount}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-forest-800/10 p-5">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Active Teams
                </p>
                <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                  {stats.teamsCount}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-forest-800/10 p-5">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Documents Issued
                </p>
                <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                  {stats.lettersCount}
                </p>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl border border-forest-800/10 p-5">
              <h2 className="font-display text-base font-semibold text-forest-950 mb-4">
                Recent Attendance Activity
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-wheat-100 text-left text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-2">Staff Member</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((log) => (
                      <tr key={log.id} className="border-t border-forest-800/5">
                        <td className="px-4 py-2.5 text-forest-950 font-medium">
                          {log.user?.fullName || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-forest-700/10 text-forest-700">
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleDateString()
                            : "Today"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recentAttendance.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    No recent attendance recorded.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}