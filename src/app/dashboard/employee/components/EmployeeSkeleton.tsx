"use client";

import React from "react";

const EmployeeSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Info Skeleton */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
        <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
      </div>

      {/* Shifts Skeleton */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-12 w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
          <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSkeleton;
