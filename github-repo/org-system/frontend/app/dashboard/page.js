"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import { api } from "../../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Dashboard" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            {!stats ? (
              <p className="text-slate-600">Loading statistics…</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Staff" value={stats.totalStaff} />
                  <StatCard label="Active Staff" value={stats.activeStaff} />
                  <StatCard label="Teams" value={stats.totalTeams} />
                  <StatCard label="Pending Reports" value={stats.pendingReports} accent />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <StatCard label="Approved Reports" value={stats.approvedReports} />
                  <StatCard label="Rejected Reports" value={stats.rejectedReports} />
                  <StatCard
                    label="Approval Rate"
                    value={
                      stats.approvedReports + stats.rejectedReports > 0
                        ? `${Math.round(
                            (stats.approvedReports / (stats.approvedReports + stats.rejectedReports)) * 100
                          )}%`
                        : "—"
                    }
                  />
                </div>

                <div className="bg-white rounded-xl border border-forest-800/10 p-6">
                  <h2 className="font-display text-lg text-forest-950 mb-4">Department Performance</h2>
                  {stats.departmentPerformance.length === 0 ? (
                    <p className="text-slate-600 text-sm">No department activity yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC4" />
                        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="performancePct" fill="#C08829" radius={[4, 4, 0, 0]} name="Performance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
