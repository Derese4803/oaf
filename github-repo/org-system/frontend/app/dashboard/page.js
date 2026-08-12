"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const dynamic = 'force-dynamic';

// Default Mock Stats for Dev Mode / Offline Fallback
const MOCK_STATS = {
  totalStaff: 42,
  activeStaff: 38,
  totalTeams: 6,
  pendingReports: 5,
  approvedReports: 28,
  rejectedReports: 2,
  departmentPerformance: [
    { department: "Operations", performancePct: 85 },
    { department: "Field Ops", performancePct: 92 },
    { department: "HR & Admin", performancePct: 78 },
    { department: "Finance", performancePct: 88 },
  ],
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboardStats()
      .then((data) => {
        setStats(data);
      })
      .catch((e) => {
        console.warn("Backend API unavailable, displaying Dev Mode mock stats:", e.message);
        // Fallback to mock data so UI and charts render in Dev Mode
        setStats(MOCK_STATS);
      });
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-wheat-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Dashboard" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            {!stats ? (
              <p className="text-slate-600 animate-pulse">Loading statistics…</p>
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
                            (stats.approvedReports /
                              (stats.approvedReports + stats.rejectedReports)) *
                              100
                          )}%`
                        : "—"
                    }
                  />
                </div>

                <div className="bg-white rounded-xl border border-forest-800/10 p-6 shadow-sm">
                  <h2 className="font-display text-lg text-forest-950 mb-4 font-semibold">
                    Department Performance
                  </h2>
                  {!stats.departmentPerformance ||
                  stats.departmentPerformance.length === 0 ? (
                    <p className="text-slate-600 text-sm">No department activity yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC4" />
                        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar
                          dataKey="performancePct"
                          fill="#C08829"
                          radius={[4, 4, 0, 0]}
                          name="Performance %"
                        />
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