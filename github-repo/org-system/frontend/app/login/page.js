"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/auth"; // Path alias ensures clean builds on Vercel

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = username.trim();
      if (!activeUser) {
        throw new Error("Please enter a username");
      }

      // Ensure NEXT_PUBLIC_API_URL is configured in Vercel environment settings
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not configured. Set NEXT_PUBLIC_API_URL in environment settings.");
      }

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: activeUser,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // First-time passcode setup routing
      if (data.requiresPasscodeSetup) {
        localStorage.setItem("pendingUser", JSON.stringify(data.user));
        router.push("/dashboard?setupPasscode=true");
        return;
      }

      // Save active session token and user profile
      saveSession(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      // Handles network errors (e.g., Render free-tier cold starts)
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Unable to connect to the backend server. If using Render free tier, please allow up to 50 seconds for spin-up and try again.");
      } else {
        setError(err.message || "Sign in failed. Check API connectivity.");
      }
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
        <p className="text-xs text-wheat-200/40">v1.0 — Production Mode</p>
      </div>

      {/* Right Form Container */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-forest-950 mb-1 font-semibold">
            Sign in
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            Enter your username. Passcode is optional for first-time accounts.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 leading-relaxed">
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
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Passcode <span className="text-xs text-slate-500 font-normal">(Leave blank if first time)</span>
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md border border-forest-800/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-800 text-wheat-50 py-2.5 rounded-md hover:bg-forest-700 transition-colors focus:ring-2 focus:ring-forest-800 disabled:opacity-60 font-medium"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Connected to Render API Database.
          </p>
        </form>
      </div>
    </div>
  );
}