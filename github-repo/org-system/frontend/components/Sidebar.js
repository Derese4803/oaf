"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, ROLE_LABELS } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", tag: "01" },
  { href: "/departments", label: "Departments", tag: "02" },
  { href: "/teams", label: "Staff & Teams", tag: "03" },
  { href: "/reports", label: "Field Reports", tag: "04" },
  { href: "/attendance", label: "Attendance", tag: "05" },
  { href: "/letters", label: "Letters", tag: "06" },
  { href: "/users", label: "HR & Users", tag: "07" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = getSession();

  return (
    <aside className="w-64 shrink-0 bg-forest-900 text-wheat-100 min-h-screen flex flex-col">
      <div className="px-6 py-7 border-b border-forest-700/60">
        <p className="font-display text-xl tracking-tight text-wheat-50">Ledger</p>
        <p className="text-xs text-wheat-200/70 mt-1">Organization Management</p>
      </div>

      <nav className="flex-1 py-4">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors focus-ring ${
                active
                  ? "bg-forest-800 text-amber-500 border-l-2 border-amber-500"
                  : "text-wheat-200/80 hover:bg-forest-800/60 hover:text-wheat-50 border-l-2 border-transparent"
              }`}
            >
              <span className="text-[10px] tabular-nums text-wheat-200/40">{item.tag}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-6 py-4 border-t border-forest-700/60">
          <p className="text-sm text-wheat-50 font-medium">{user.fullName}</p>
          <p className="text-xs text-wheat-200/60">{ROLE_LABELS[user.role] || user.role}</p>
        </div>
      )}
    </aside>
  );
}
