"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { saveSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      saveSession(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-wheat-50">
      <div className="hidden md:flex flex-col justify-between bg-forest-900 text-wheat-50 p-12">
        <div>
          <p className="font-display text-2xl">Ledger</p>
          <p className="text-wheat-200/70 text-sm mt-1">Organization Management System</p>
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
        <p className="text-xs text-wheat-200/40">v1.0 — Phase 1 MVP</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-forest-950 mb-1">Sign in</h1>
          <p className="text-slate-600 text-sm mb-8">Use the credentials issued by HR.</p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <label className="block text-sm text-forest-800 mb-1">Username</label>
          <input
            className="w-full mb-4 px-3 py-2 rounded-md border border-forest-800/20 bg-white focus-ring"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />

          <label className="block text-sm text-forest-800 mb-1">Password</label>
          <input
            type="password"
            className="w-full mb-6 px-3 py-2 rounded-md border border-forest-800/20 bg-white focus-ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-800 text-wheat-50 py-2.5 rounded-md hover:bg-forest-700 transition-colors focus-ring disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-slate-600 mt-6">
            Demo accounts (password: password123): admin, manager1, fieldmgr1, supervisor1, abebe.k
          </p>
        </form>
      </div>
    </div>
  );
}
