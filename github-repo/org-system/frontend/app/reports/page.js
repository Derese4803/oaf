"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";
import { getSession } from "../../lib/auth";

const STATUS_STYLES = {
  SUBMITTED: "bg-amber-500/15 text-amber-600",
  APPROVED: "bg-forest-700/10 text-forest-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { user } = getSession();
  const canReview = ["SUPERVISOR", "FIELD_MANAGER", "MANAGER", "SUPER_ADMIN"].includes(user?.role);

  function load() {
    api.getReports().then(setReports).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createReport({ title, description });
      setTitle("");
      setDescription("");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReview(id, status) {
    try {
      await api.reviewReport(id, status);
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
          <Navbar title="Field Reports" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            {user?.role === "ENUMERATOR" && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-forest-800/10 p-5 mb-6 max-w-xl">
                <h2 className="font-display text-lg text-forest-950 mb-3">Submit a report</h2>
                <input
                  className="w-full mb-3 px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Report title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full mb-3 px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Details of field activity…"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button className="px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                  Submit report
                </button>
              </form>
            )}

            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-forest-800/10 p-5 flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-base text-forest-950">{r.title}</h3>
                    {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
                    <p className="text-xs text-slate-600 mt-2">
                      By {r.submitter?.fullName} · {r.team?.name || "No team"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    {canReview && r.status === "SUBMITTED" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(r.id, "APPROVED")}
                          className="text-xs px-3 py-1 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(r.id, "REJECTED")}
                          className="text-xs px-3 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 focus-ring"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {reports.length === 0 && <p className="text-slate-600">No reports yet.</p>}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
