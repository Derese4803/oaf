"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { getSession, saveSession } from "@/lib/auth";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    usersCount: 0,
    departmentsCount: 0,
    teamsCount: 0,
    lettersCount: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [passcodeSubmitting, setPasscodeSubmitting] = useState(false);

  useEffect(() => {
    const isPasscodeSetup = searchParams.get("setupPasscode") === "true";
    if (isPasscodeSetup) {
      setShowPasscodeModal(true);
    }

    let isMounted = true;

    async function loadData() {
      try {
        const [users, departments, teams, letters, attendance] = await Promise.all([
          api.getUsers().catch(() => []),
          api.getDepartments().catch(() => []),
          api.getTeams().catch(() => []),
          api.getLetters().catch(() => []),
          api.getAttendance().catch(() => []),
        ]);

        if (isMounted) {
          setStats({
            usersCount: users?.length || 0,
            departmentsCount: departments?.length || 0,
            teamsCount: teams?.length || 0,
            lettersCount: letters?.length || 0,
          });
          setRecentAttendance((attendance || []).slice(0, 5));
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e.message || "Failed to load dashboard statistics.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  async function handlePasscodeSubmit(e) {
    e.preventDefault();
    setPasscodeError("");

    if (newPasscode.length < 4) {
      setPasscodeError("Passcode must be at least 4 characters.");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeError("Passcodes do not match.");
      return;
    }

    setPasscodeSubmitting(true);
    try {
      const session = getSession();
      const rawPending = typeof window !== "undefined" ? localStorage.getItem("pendingUser") : null;
      const pendingUser = rawPending ? JSON.parse(rawPending) : session?.user;

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/api/auth/set-passcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token || ""}`,
        },
        body: JSON.stringify({
          userId: pendingUser?.id,
          username: pendingUser?.username,
          passcode: newPasscode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to set passcode");
      }

      if (data.token) {
        saveSession(data.token, data.user || pendingUser);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingUser");
      }
      setShowPasscodeModal(false);

      router.replace("/dashboard");
    } catch (err) {
      setPasscodeError(err.message);
    } finally {
      setPasscodeSubmitting(false);
    }
  }

  function handleDismissModal() {
    setShowPasscodeModal(false);
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-wheat-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="Dashboard Overview" />
        <main className="p-8">
          {error && <p className="text-red-700 mb-4 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-forest-800/10 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Total Staff</p>
              <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                {loading ? "..." : stats.usersCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-forest-800/10 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Departments</p>
              <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                {loading ? "..." : stats.departmentsCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-forest-800/10 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Active Teams</p>
              <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                {loading ? "..." : stats.teamsCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-forest-800/10 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Documents Issued</p>
              <p className="font-display text-2xl text-forest-950 mt-1 font-semibold">
                {loading ? "..." : stats.lettersCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-forest-800/10 p-5 shadow-sm">
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
                    <tr key={log.id || log._id} className="border-t border-forest-800/5">
                      <td className="px-4 py-2.5 text-forest-950 font-medium">
                        {log.user?.fullName || log.username || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-forest-700/10 text-forest-700">
                          {log.status || "Present"}
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
              {!loading && recentAttendance.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">No recent attendance recorded.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-display text-2xl font-bold text-forest-950">
                Set Up Your Passcode
              </h2>
              <button
                onClick={handleDismissModal}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Welcome! Since this is your first sign-in, please create a secure passcode for future logins.
            </p>

            {passcodeError && (
              <div className="mb-4 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200">
                {passcodeError}
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  New Passcode
                </label>
                <input
                  type="password"
                  required
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Confirm Passcode
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={passcodeSubmitting}
                  className="w-full bg-forest-800 text-white py-2.5 rounded-md hover:bg-forest-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {passcodeSubmitting ? "Saving Passcode…" : "Save Passcode & Continue"}
                </button>
                <button
                  type="button"
                  onClick={handleDismissModal}
                  className="w-full text-slate-500 hover:text-slate-700 py-1.5 text-xs text-center"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-wheat-50 p-8 text-forest-900 font-medium">Loading Dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
