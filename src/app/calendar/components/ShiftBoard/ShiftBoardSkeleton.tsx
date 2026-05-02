"use client";

import React from "react";
import { motion } from "framer-motion";

const ShiftBoardSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-slate-100 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-100 rounded-lg"></div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bento-card min-h-[600px] bg-slate-50/50">
          <div className="space-y-4">
            <div className="h-8 w-full bg-slate-100 rounded"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bento-card bg-slate-50/50 h-48"></div>
          <div className="bento-card bg-slate-50/50 h-96"></div>
        </div>
      </div>
    </div>
  );
};

export default ShiftBoardSkeleton;
