"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Home, Calendar, Workflow, Share2, Settings, Zap } from "lucide-react";
import useIsMobile from "../../../hooks/useIsMobile";
import { clsx } from "clsx";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  {
    name: "Employees",
    href: "/dashboard/manager/employees",
    icon: Users,
  },
  {
    name: "Assign Users",
    href: "/dashboard/manager/employees/assign",
    icon: Workflow,
  },
  {
    name: "Share",
    href: "/dashboard/manager/employees/share",
    icon: Share2,
  },
  { name: "Full Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <aside
      className={clsx(
        "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300",
        isMobile ? "w-20" : "w-64"
      )}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 px-2 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>
          {!isMobile && (
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">
              Oh-Shift
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {sidebarLinks.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )}
                />
                {!isMobile && <span className="font-medium text-sm">{name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        {!isMobile && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Enterprise Pro
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Shift management at scale.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
