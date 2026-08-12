"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const EVENT_LABELS = {
  CLOCK_IN: "Clocked in",
  CLOCK_OUT: "Clocked out",
  BREAK_START: "Break started",
  BREAK_END: "Break ended",
};

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.getTodayAttendance().then(setLogs).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function log(event) {
    setError("");
    try {
      await api.logAttendanceEvent(event);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const lastEvent = logs[logs.length - 1]?.event;
  const clockedIn = lastEvent === "CLOCK_IN" || lastEvent === "BREAK_END";
  const onBreak = lastEvent === "BREAK_START";

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Attendance" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <div className="bg-white rounded-xl border border-forest-800/10 p-6 max-w-lg mb-8">
              <h2 className="font-display text-lg text-forest-950 mb-4">Today</h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => log("CLOCK_IN")}
                  disabled={clockedIn || onBreak}
                  className="px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring disabled:opacity-40"
                >
                  🕐 Clock In
                </button>
                <button
                  onClick={() => log("BREAK_START")}
                  disabled={!clockedIn || onBreak}
                  className="px-4 py-2 rounded-md bg-amber-600 text-wheat-50 hover:bg-amber-500 focus-ring disabled:opacity-40"
                >
                  ☕ Start Break
                </button>
                <button
                  onClick={() => log("BREAK_END")}
                  disabled={!onBreak}
                  className="px-4 py-2 rounded-md border border-forest-800/30 text-forest-800 hover:bg-wheat-100 focus-ring disabled:opacity-40"
                >
                  ▶ End Break
                </button>
                <button
                  onClick={() => log("CLOCK_OUT")}
                  disabled={!clockedIn && !onBreak}
                  className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 focus-ring disabled:opacity-40"
                >
                  🕐 Clock Out
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-forest-800/10 p-6 max-w-lg">
              <h2 className="font-display text-lg text-forest-950 mb-4">Today's log</h2>
              <ul className="space-y-2">
                {logs.map((l) => (
                  <li key={l.id} className="flex justify-between text-sm">
                    <span className="text-forest-800">{EVENT_LABELS[l.event]}</span>
                    <span className="text-slate-600">{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </li>
                ))}
                {logs.length === 0 && <p className="text-slate-600 text-sm">No activity logged yet today.</p>}
              </ul>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}