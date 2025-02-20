"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, Calendar, Workflow, Share2 } from "lucide-react";
import useIsMobile from "../../../hooks/useIsMobile";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  {
    name: "Share Calendar",
    href: "/dashboard/manager/employees/share",
    icon: Share2,
  },
  {
    name: "Manage Employees",
    href: "/dashboard/manager/employees",
    icon: Users,
  },
  { name: "Calendar", href: "/shifts", icon: Calendar },
  {
    name: "Assign Users",
    href: "/dashboard/manager/employees/assign",
    icon: Workflow,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile(); // returns true if mobile
  const asideWidth = isMobile ? "w-24" : "w-64";

  return (
    <aside
      className={`${asideWidth} h-screen bg-bg-800 text-text-secondary shadow-lg flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-5 text-2xl font-bold text-highlight border-b border-bg-700">
        Oh-Shift
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {sidebarLinks.map(({ name, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <div
              className={`flex items-center gap-3 px-4 py-4 rounded-lg cursor-pointer transition font-medium ${
                pathname === href
                  ? "bg-highlight text-background"
                  : "hover:bg-bg-700 text-text-secondary"
              }`}
            >
              <Icon className="w-6 h-6" />
              {!isMobile && <span>{name}</span>}
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
