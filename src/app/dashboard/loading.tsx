"use client";

import { Calendar } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="relative">
        <div className="w-16 h-16 border-[3px] border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
          Loading dashboard
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Please wait...
        </p>
      </div>
    </div>
  );
}
