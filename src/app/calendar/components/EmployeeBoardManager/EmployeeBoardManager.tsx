"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Layout } from "lucide-react";
import HoverModal from "../ShiftBoardManager/HoverModal";
import CustomFullCalendar from "./CustomFullCalendar";
import MobileFullCalendar from "./MobileFullCalendar";
import useIsMobile from "../../../hooks/useIsMobile";
import { Shift } from "../../../types/index";
import { fetchEmployeeShifts } from "../../handlers/useEmployeeShiftHandlers";

const EmployeeBoardManager: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverModalData, setHoverModalData] = useState<{
    x: number;
    y: number;
    shift: Shift;
  } | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchEmployeeShifts(setShifts).finally(() => setLoading(false));
  }, []);

  const mapShiftsToEvents = (shifts: Shift[]) => {
    return shifts.map((shift) => ({
      id: shift.id,
      title:
        shift.allDay || !shift.employees?.length
          ? shift.title || "All Day Shift"
          : (shift.employees || []).map((e) => e.name).join(", ") ||
            "No Employees",
      start: shift.startTime,
      end: shift.endTime,
      allDay: shift.allDay,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs">
            <Layout size={14} />
            Employee Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Schedule
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            View and manage your upcoming work assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Shifts Assigned</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{shifts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <motion.div variants={itemVariants} className="bento-card overflow-hidden !p-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-500" size={20} />
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Weekly View</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Assigned Shifts
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              All Day / Global
            </div>
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Syncing shifts...</p>
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                {isMobile ? (
                  <MobileFullCalendar
                    shifts={shifts}
                    mapShiftsToEvents={mapShiftsToEvents}
                    setHoverModalData={setHoverModalData}
                  />
                ) : (
                  <CustomFullCalendar
                    shifts={shifts}
                    mapShiftsToEvents={mapShiftsToEvents}
                    setHoverModalData={setHoverModalData}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Hover Modal */}
      {!isMobile && (
        <HoverModal
          x={hoverModalData?.x ?? 0}
          y={hoverModalData?.y ?? 0}
          startTime={
            hoverModalData?.shift?.startTime
              ? new Date(hoverModalData.shift.startTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : ""
          }
          endTime={
            hoverModalData?.shift?.endTime
              ? new Date(hoverModalData.shift.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          }
          employees={
            hoverModalData && !hoverModalData.shift.allDay
              ? hoverModalData.shift.employees.map((emp) => ({
                  name: emp.name,
                  position: emp.position ?? "N/A",
                }))
              : []
          }
          isVisible={!!hoverModalData}
        />
      )}
    </motion.div>
  );
};

export default EmployeeBoardManager;
