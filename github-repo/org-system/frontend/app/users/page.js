"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";
import { ROLE_LABELS } from "../../lib/auth";

const ROLES = Object.keys(ROLE_LABELS);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employeeId: "", fullName: "", username: "", password: "",
    role: "ENUMERATOR", position: "", departmentId: "",
  });

  function load() {
    api.getUsers().then(setUsers).catch((e) => setError(e.message));
    api.getDepartments().then(setDepartments).catch(() => {});
  }

  useEffect(load, []);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createUser(form);
      setForm({ employeeId: "", fullName: "", username: "", password: "", role: "ENUMERATOR", position: "", departmentId: "" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleStatus(u) {
    try {
      await api.updateUser(u.id, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="HR & Users" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-forest-800/10 p-5 mb-8 max-w-2xl">
              <h2 className="font-display text-lg text-forest-950 mb-3">Create user account</h2>
              <div className="grid grid-cols-2 gap-3">
                <input className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring" placeholder="Employee ID"
                  value={form.employeeId} onChange={(e) => updateForm("employeeId", e.target.value)} required />
                <input className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring" placeholder="Full name"
                  value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} required />
                <input className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring" placeholder="Username"
                  value={form.username} onChange={(e) => updateForm("username", e.target.value)} required />
                <input type="password" className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring" placeholder="Temporary password"
                  value={form.password} onChange={(e) => updateForm("password", e.target.value)} required />
                <select className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.role} onChange={(e) => updateForm("role", e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                <select className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={form.departmentId} onChange={(e) => updateForm("departmentId", e.target.value)}>
                  <option value="">Department…</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring col-span-2" placeholder="Position (optional)"
                  value={form.position} onChange={(e) => updateForm("position", e.target.value)} />
              </div>
              <button className="mt-4 px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Create account
              </button>
            </form>

            <div className="bg-white rounded-xl border border-forest-800/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-wheat-100 text-left text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-forest-800/5">
                      <td className="px-4 py-3 text-forest-950">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.username}</td>
                      <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role]}</td>
                      <td className="px-4 py-3 text-slate-600">{u.department?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.status === "ACTIVE" ? "bg-forest-700/10 text-forest-700" : "bg-red-100 text-red-700"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(u)} className="text-xs text-amber-600 hover:underline focus-ring">
                          {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="p-4 text-slate-600">No users yet.</p>}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
