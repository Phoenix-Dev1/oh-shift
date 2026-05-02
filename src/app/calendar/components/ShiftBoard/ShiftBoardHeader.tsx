"use client";

import React from "react";
import { Plus, Calendar as CalendarIcon, LayoutGrid, List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { ViewMode } from "../../hooks/useShiftBoard";
import { motion } from "framer-motion";

interface ShiftBoardHeaderProps {
  onAddShift: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Date;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ShiftBoardHeader: React.FC<ShiftBoardHeaderProps> = ({
  onAddShift,
  viewMode,
  setViewMode,
  currentDate,
  onToday,
  onPrevious,
  onNext
}) => {
  const modes: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'day', label: 'Day', icon: List },
    { id: 'week', label: 'Week', icon: LayoutGrid },
    { id: 'month', label: 'Month', icon: CalendarDays },
  ];

  const getDisplayedDateRange = () => {
    if (viewMode === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
    if (viewMode === 'week') return "Week of " + format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMMM d, yyyy');
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    return "";
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 hidden md:flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <div>
          {/* Phase 3: Navigation Group */}
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={onPrevious}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight ml-2">
              {getDisplayedDateRange()}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Phase 2: Segmented Control Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 relative">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === mode.id
                  ? "text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              <mode.icon className="w-3.5 h-3.5" />
              {mode.label}
              {viewMode === mode.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

        <button
          onClick={onAddShift}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Shift
        </button>
      </div>
    </header>
  );
};

export default ShiftBoardHeader;
