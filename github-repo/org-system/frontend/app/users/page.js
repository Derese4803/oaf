"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const ROLE_BADGES = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  STAFF: "bg-forest-700/10 text-forest-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "STAFF",
    departmentId: "",
    teamId: "",
  });

  function load() {
    api.getUsers().then(setUsers).catch((e) => setError(e.message));
    api.getDepartments().then(setDepartments).catch(() => {});
    api.getTeams().then(setTeams).catch(() => {});
  }

  useEffect(() => {
    setIsMounted(true);
    load();
  }, []);

  // Prevent client state execution during SSR / static prerendering
  if (!isMounted) {
    return null;
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createUser(form);
      setForm({
        fullName: "",
        email: "",
        role: "STAFF",
        departmentId: "",
        teamId: "",
      });
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
          <Navbar title="Staff Directory & Users" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form
              onSubmit={handleCreateUser}
              className="bg-white rounded-xl border border-forest-800/10 p-5 mb-8 max-w-2xl"
            >
              <h2 className="font-display text-lg text-forest-950 mb-3">
                Register new user
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                />
                <select
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                >
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.departmentId}
                  onChange={(e) => updateForm("departmentId", e.target.value)}
                >
                  <option value="">Department (Optional)…</option>
                  {(departments || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring md:col-span-2"
                  value={form.teamId}
                  onChange={(e) => updateForm("teamId", e.target.value)}
                >
                  <option value="">Team (Optional)…</option>
                  {(teams || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="mt-4 px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Add staff member
              </button>
            </form>

            <div className="bg-white rounded-xl border border-forest-800/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-wheat-100 text-left text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {(users || []).map((u) => (
                    <tr key={u.id} className="border-t border-forest-800/5">
                      <td className="px-4 py-3 text-forest-950 font-medium">
                        {u.fullName || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ROLE_BADGES[u.role] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.department?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.team?.name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!users || users.length === 0) && (
                <p className="p-4 text-slate-600">No users found.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}