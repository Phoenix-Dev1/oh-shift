"use client";

import React from "react";
import useIsMobile from "../../../hooks/useIsMobile";

const ShiftBoardSkeleton = () => {
  const isMobile = useIsMobile();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        {/* Left: Navigation */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hidden md:flex items-center justify-center">
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded opacity-50"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-14 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
              <div className={`h-6 bg-slate-100 dark:bg-slate-800 rounded-md ml-2 ${isMobile ? "w-32" : "w-48"}`}></div>
            </div>
          </div>
        </div>

        {/* Right: View Toggle (hidden on mobile) + Create button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {!isMobile && (
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
              <div className="h-8 w-20 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"></div>
              <div className="h-8 w-20 bg-transparent rounded-lg"></div>
              <div className="h-8 w-20 bg-transparent rounded-lg"></div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[800px]">
        {/* Grid Header */}
        <div className={`grid ${isMobile ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,1fr)]"} border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30`}>
          <div className="p-4 border-r border-slate-200 dark:border-slate-800" />
          {isMobile ? (
            /* Single day column header on mobile */
            <div className="p-4 flex flex-col items-center gap-2">
              <div className="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded opacity-30"></div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded opacity-50"></div>
            </div>
          ) : (
            /* 7 day column headers on desktop */
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-4 flex flex-col items-center gap-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                <div className="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded opacity-30"></div>
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded opacity-50"></div>
              </div>
            ))
          )}
        </div>

        {/* All Day Row */}
        <div className={`grid ${isMobile ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,1fr)]"} border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10 min-h-[56px]`}>
          <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 space-y-1">
            <div className="h-2 w-4 bg-slate-200 dark:bg-slate-700 rounded opacity-30"></div>
            <div className="h-2 w-4 bg-slate-200 dark:bg-slate-700 rounded opacity-30"></div>
          </div>
          {Array.from({ length: isMobile ? 1 : 7 }).map((_, i) => (
            <div key={i} className="border-r border-slate-200 dark:border-slate-800 last:border-r-0" />
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-hidden">
          <div className={`grid ${isMobile ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,1fr)]"} h-full`}>
            {/* Time Column */}
            <div className="border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-3 md:p-4 space-y-10 md:space-y-12">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-2 w-8 bg-slate-200 dark:bg-slate-700 rounded opacity-20"></div>
              ))}
            </div>

            {isMobile ? (
              /* Single day column on mobile with stacked shift cards */
              <div className="relative p-2 overflow-hidden">
                <div className="h-20 w-full bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mt-4 shadow-sm"></div>
                <div className="h-14 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-6 shadow-sm"></div>
                <div className="h-28 w-full bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mt-6 shadow-sm"></div>
                <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-8 shadow-sm"></div>
              </div>
            ) : (
              /* 7 day columns on desktop */
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 p-2 overflow-hidden">
                  {i % 2 === 0 && (
                    <div className="h-24 w-full bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mt-4 shadow-sm"></div>
                  )}
                  {i % 3 === 0 && (
                    <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-12 shadow-sm"></div>
                  )}
                  {i % 4 === 0 && (
                    <div className="h-32 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 mt-20 shadow-sm"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftBoardSkeleton;
