"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession } from "@/lib/auth";

export default function Navbar({ title }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await api.checkSchedule();
        const data = await api.getNotifications();
        if (!cancelled) setNotifications(data);
      } catch (e) {
        // silent fail on notification polling
      }
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // re-check every 5 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-forest-800/10 bg-wheat-50">
      <h1 className="font-display text-2xl text-forest-950">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative w-10 h-10 rounded-full bg-forest-800 text-wheat-50 flex items-center justify-center focus-ring"
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-forest-800/10 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="p-4 text-sm text-slate-600">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => api.markNotificationRead(n.id).then(() =>
                    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                  )}
                  className={`w-full text-left px-4 py-3 border-b border-forest-800/5 text-sm hover:bg-wheat-100 focus-ring ${
                    n.read ? "text-slate-600" : "text-forest-950 font-medium"
                  }`}
                >
                  {n.message}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="text-sm px-4 py-2 rounded-md border border-forest-800/20 text-forest-800 hover:bg-forest-800 hover:text-wheat-50 transition-colors focus-ring"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
