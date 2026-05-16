"use client";

import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Analytics Controls Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div>
          </div>
          <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
          </div>
          <div className="h-12 w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-xl"></div>
        </div>
      </div>

      {/* Results Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Mobile Skeleton */}
        <div className="md:hidden p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
