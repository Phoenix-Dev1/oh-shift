"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import useIsMobile from "../../../hooks/useIsMobile";
import InfinityLoader from "@/src/app/components/LoadingInfinity/InfinityLoader";
import { Calendar, BarChart3, Clock, Users } from "lucide-react";

interface EmployeeAggregate {
  id: string;
  name: string;
  shiftCount: number;
  totalHours: number;
}

function getWeekPeriodClient(
  year: number,
  month: number,
  weekIndex: number
): { start: Date; end: Date } {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  let start: Date, end: Date;

  if (firstDayOfMonth.getDay() === 0) {
    start = new Date(firstDayOfMonth);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else {
    if (weekIndex === 1) {
      start = new Date(firstDayOfMonth);
      start.setHours(0, 0, 0, 0);
      end = new Date(firstDayOfMonth);
      const daysToSaturday = 6 - firstDayOfMonth.getDay();
      end.setDate(end.getDate() + daysToSaturday);
    } else {
      const firstSunday = new Date(firstDayOfMonth);
      if (firstSunday.getDay() !== 0) {
        firstSunday.setDate(firstSunday.getDate() + (7 - firstSunday.getDay()));
      }
      start = new Date(firstSunday);
      start.setDate(start.getDate() + (weekIndex - 2) * 7);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    }
  }

  if (end > lastDayOfMonth) {
    end = new Date(lastDayOfMonth);
    end.setHours(23, 59, 59, 999);
  } else {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export default function EmployeeAggregatesPage() {
  const isMobile = useIsMobile();
  const [periodType, setPeriodType] = useState<"month" | "specificWeek" | "currentWeek">("month");
  const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [employeeData, setEmployeeData] = useState<EmployeeAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [weekAnnotations, setWeekAnnotations] = useState<Record<number, string>>({});

  const periodTypes: Array<"month" | "specificWeek" | "currentWeek"> = ["month", "specificWeek", "currentWeek"];

  const fetchAggregates = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/employees/dashboard`;
      if (periodType === "month") {
        const [year, month] = selectedMonth.split("-");
        url += `?year=${year}&month=${month}`;
      } else if (periodType === "specificWeek") {
        const [year, month] = selectedMonth.split("-");
        url += `?year=${year}&month=${month}&week=${selectedWeek}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data: EmployeeAggregate[] = await res.json();
      setEmployeeData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [periodType, selectedMonth, selectedWeek]);

  useEffect(() => {
    const selectedYear = Number(selectedMonth.split("-")[0]);
    const selectedMonthNumber = Number(selectedMonth.split("-")[1]);
    const today = new Date();
    const annotations: Record<number, string> = {};
    let currentWeekIndex: number | null = null;

    for (let week = 1; week <= 5; week++) {
      const { start, end } = getWeekPeriodClient(selectedYear, selectedMonthNumber, week);
      if (start.getMonth() + 1 !== selectedMonthNumber) continue;
      if (today >= start && today <= end) currentWeekIndex = week;
    }

    if (currentWeekIndex !== null) {
      const { start: nextWeekStart } = getWeekPeriodClient(selectedYear, selectedMonthNumber, currentWeekIndex + 1);
      if (nextWeekStart.getMonth() + 1 === selectedMonthNumber) {
        annotations[currentWeekIndex] = " (Current)";
        if (currentWeekIndex - 1 >= 1) annotations[currentWeekIndex - 1] = " (Previous)";
      }
    }
    setWeekAnnotations(annotations);
  }, [selectedMonth]);

  useEffect(() => { fetchAggregates(); }, [fetchAggregates]);

  if (loading) return <div className="flex justify-center items-center h-[400px]"><InfinityLoader /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Analytics Controls - Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BarChart3 className="w-24 h-24 text-indigo-600" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter team efficiency by custom time periods.</p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {periodTypes.map((type) => (
              <button
                key={type}
                onClick={() => setPeriodType(type)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  periodType === type
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {type === "month" ? "Month" : type === "specificWeek" ? "Week" : "Current"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {(periodType === "month" || periodType === "specificWeek") && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                Active Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {periodType === "specificWeek" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                Week Index
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {`Week ${num}${weekAnnotations[num] || ""}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={fetchAggregates}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Update Metrics
          </button>
        </div>
      </div>

      {/* Results Table - Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {employeeData.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No analytical data available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adjust your filters to see member performance.</p>
          </div>
        ) : isMobile ? (
          <div className="p-4 space-y-3">
            {employeeData.map((emp) => (
              <div key={emp.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{emp.name}</h4>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Shifts: {emp.shiftCount}</span>
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-3 h-3" /> {emp.totalHours.toFixed(1)} hrs</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Employee Name</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Completed Shifts</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employeeData.map((emp) => (
                <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{emp.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {emp.shiftCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{emp.totalHours.toFixed(2)} hrs</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
