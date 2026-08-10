"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");

  function load() {
    api.getTeams().then(setTeams).catch((e) => setError(e.message));
    api.getDepartments().then(setDepartments).catch(() => {});
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createTeam(name, departmentId);
      setName("");
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
          <Navbar title="Staff & Teams" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-xl">
              <input
                className="flex-1 px-3 py-2 rounded-md border border-forest-800/20 bg-white focus-ring"
                placeholder="New team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <select
                className="px-3 py-2 rounded-md border border-forest-800/20 bg-white focus-ring"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Department…</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button className="px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Create team
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-forest-800/10 p-5">
                  <h3 className="font-display text-lg text-forest-950">{t.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{t.department?.name} · {t._count?.reports ?? 0} reports</p>
                  <ul className="mt-3 space-y-1">
                    {t.members.map((m) => (
                      <li key={m.user.id} className="text-sm text-forest-800">
                        {m.user.fullName} <span className="text-slate-600">— {m.user.role}</span>
                      </li>
                    ))}
                    {t.members.length === 0 && <li className="text-sm text-slate-600">No members yet.</li>}
                  </ul>
                </div>
              ))}
              {teams.length === 0 && <p className="text-slate-600">No teams yet.</p>}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
