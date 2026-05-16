"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Calendar } from "lucide-react";

interface HoverModalProps {
  x: number;
  y: number;
  startTime: string;
  endTime: string;
  employees: { name: string; position: string }[];
  isVisible: boolean;
}

const HoverModal: React.FC<HoverModalProps> = ({
  x,
  y,
  startTime,
  endTime,
  employees,
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="fixed z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 w-72 pointer-events-none"
          style={{
            top: `${y + 15}px`,
            left: `${x + 15}px`,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Shift Details</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="text-slate-400 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Slot</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {startTime} {endTime ? `- ${endTime}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="text-slate-400 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Team Members</p>
                  {employees.length > 0 ? (
                    <div className="mt-1.5 space-y-2">
                      {employees.slice(0, 4).map((emp, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{emp.name}</span>
                          <span className="text-[11px] text-slate-500">{emp.position}</span>
                        </div>
                      ))}
                      {employees.length > 4 && (
                        <p className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 inline-block px-2 py-0.5 rounded-full">
                          + {employees.length - 4} More
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-500 mt-1">No assignments yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Corner Accent */}
          <div className="absolute top-0 right-0 p-4">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HoverModal;
