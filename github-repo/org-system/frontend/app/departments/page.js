"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  function load() {
    api
      .getDepartments()
      .then(setDepartments)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    setIsMounted(true);
    load();
  }, []);

  // Prevent client auth and rendering during static build prerendering
  if (!isMounted) {
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createDepartment({ name, code });
      setName("");
      setCode("");
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
          <Navbar title="Departments" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form
              onSubmit={handleCreate}
              className="bg-white rounded-xl border border-forest-800/10 p-5 mb-8 max-w-xl"
            >
              <h2 className="font-display text-lg text-forest-950 mb-3">
                Add new department
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <input
                  className="col-span-2 px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Department name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Code (e.g. HR)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button className="mt-4 px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Create department
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-xl border border-forest-800/10 p-5 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-display text-base text-forest-950 font-semibold">
                      {d.name}
                    </h3>
                    {d.code && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-wheat-100 text-slate-700 font-mono">
                        {d.code}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{d._count?.users ?? d.users?.length ?? 0} members</p>
                    <p className="mt-1">
                      {d._count?.teams ?? d.teams?.length ?? 0} teams
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {departments.length === 0 && (
              <p className="text-slate-600">No departments configured yet.</p>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}