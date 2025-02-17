// src/components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, Calendar, Settings } from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Manage Employees", href: "/dashboard/employees", icon: Users },
  { name: "Calendar", href: "/shifts", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-bg-800 text-text-secondary shadow-lg flex flex-col">
      {/* Sidebar Header */}
      <div className="p-5 text-2xl font-bold text-highlight border-b border-bg-700">
        Oh-Shift
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {sidebarLinks.map(({ name, href, icon: Icon }) => (
          <Link key={name} href={href}>
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition font-medium ${
                pathname === href
                  ? "bg-highlight text-background"
                  : "hover:bg-bg-700 text-text-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-text-secondary border-t border-bg-700">
        Oh-Shift
      </div>
    </aside>
  );
}
