"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = username.trim() || "admin";

      const mockUser = {
        id: `dev-${role.toLowerCase()}-1`,
        username: activeUser,
        name: activeUser.toUpperCase(),
        role: role,
      };

      // Save session token to local storage
      saveSession("dev-bypass-token-12345", mockUser);

      // Redirect to main dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-wheat-50">
      {/* Left Sidebar branding */}
      <div className="hidden md:flex flex-col justify-between bg-forest-900 text-wheat-50 p-12">
        <div>
          <p className="font-display text-2xl font-bold">Ledger</p>
          <p className="text-wheat-200/70 text-sm mt-1">
            Organization Management System
          </p>
        </div>
        <div>
          <p className="font-display text-3xl leading-snug max-w-sm">
            One chain of command, from the field to the front office.
          </p>
          <p className="text-wheat-200/60 text-sm mt-6 max-w-sm">
            Manager → Field Manager → Supervisor → Enumerator. Reports, attendance,
            and correspondence, tracked in one place.
          </p>
        </div>
        <p className="text-xs text-wheat-200/40">v1.0 — Phase 1 MVP (Dev Bypass Active)</p>
      </div>

      {/* Right Form Container */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-forest-950 mb-1 font-semibold">
            Sign in
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            Dev Mode: Password check disabled. Select role and hit sign in.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-forest-800/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Select Dev Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-forest-800/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="FIELD_MANAGER">Field Manager</option>
              <option value="ENUMERATOR">Enumerator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-800 text-wheat-50 py-2.5 rounded-md hover:bg-forest-700 transition-colors focus:ring-2 focus:ring-forest-800 disabled:opacity-60 font-medium"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Development mode active. Authenticates client-side directly.
          </p>
        </form>
      </div>
    </div>
  );
}