"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { user } = getSession();

  function load() {
    api.getDepartments().then(setDepartments).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createDepartment(name);
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
          <Navbar title="Departments" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            {user?.role === "SUPER_ADMIN" && (
              <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
                <input
                  className="flex-1 px-3 py-2 rounded-md border border-forest-800/20 bg-white focus-ring"
                  placeholder="New department name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <button className="px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                  Add
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map((d) => (
                <div key={d.id} className="bg-white rounded-xl border border-forest-800/10 p-5">
                  <h3 className="font-display text-lg text-forest-950">{d.name}</h3>
                  <p className="text-sm text-slate-600 mt-2">{d._count.users} staff · {d._count.teams} teams</p>
                </div>
              ))}
              {departments.length === 0 && <p className="text-slate-600">No departments yet.</p>}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}