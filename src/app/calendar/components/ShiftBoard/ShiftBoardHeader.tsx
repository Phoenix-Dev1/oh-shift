"use client";

import React from "react";
import { Plus, Users, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ShiftBoardHeaderProps {
  onAddShift: () => void;
}

const ShiftBoardHeader: React.FC<ShiftBoardHeaderProps> = ({ onAddShift }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-500" />
          Shift Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Plan, coordinate, and assign team schedules with ease.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAddShift}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Shift
        </button>
      </div>
    </header>
  );
};

export default ShiftBoardHeader;
