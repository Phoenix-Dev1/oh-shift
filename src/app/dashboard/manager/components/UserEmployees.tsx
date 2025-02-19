"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import useIsMobile from "../../../hooks/useIsMobile";

interface EmployeeAggregate {
  id: string;
  name: string;
  shiftCount: number;
  totalHours: number;
}

/**
 * Helper: replicate the API’s getWeekPeriod logic on the client.
 * Given a year, month, and weekIndex (1-indexed), returns the start and end dates of that week.
 */
function getWeekPeriodClient(
  year: number,
  month: number,
  weekIndex: number
): { start: Date; end: Date } {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  let start: Date, end: Date;

  if (firstDayOfMonth.getDay() === 0) {
    // Month starts on Sunday: week1 starts on the 1st.
    start = new Date(firstDayOfMonth);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else {
    if (weekIndex === 1) {
      // Week 1: from the 1st to the first Saturday.
      start = new Date(firstDayOfMonth);
      start.setHours(0, 0, 0, 0);
      end = new Date(firstDayOfMonth);
      const daysToSaturday = 6 - firstDayOfMonth.getDay();
      end.setDate(end.getDate() + daysToSaturday);
    } else {
      // For week 2 and beyond, determine the first Sunday in the month.
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

  // Clamp the end to the last day of the month.
  if (end > lastDayOfMonth) {
    end = new Date(lastDayOfMonth);
    // Set to the end of that day.
    end.setHours(23, 59, 59, 999);
  } else {
    // Otherwise, set end to Saturday's end.
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export default function EmployeeAggregatesPage() {
  const isMobile = useIsMobile();
  const [periodType, setPeriodType] = useState<
    "month" | "specificWeek" | "currentWeek"
  >("month");
  const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [employeeData, setEmployeeData] = useState<EmployeeAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Week annotations: mapping week number to annotation string (e.g., " (Current)" or " (Previous)")
  const [weekAnnotations, setWeekAnnotations] = useState<
    Record<number, string>
  >({});

  // Define the period types with an explicit type.
  const periodTypes: Array<"month" | "specificWeek" | "currentWeek"> = [
    "month",
    "specificWeek",
    "currentWeek",
  ];

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
      if (!res.ok) throw new Error("Failed to fetch employee data");
      const data: EmployeeAggregate[] = await res.json();
      setEmployeeData(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error fetching employee data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [periodType, selectedMonth, selectedWeek]);

  // Update week annotations based on the selected month and today’s date.
  useEffect(() => {
    const selectedYear = Number(selectedMonth.split("-")[0]);
    const selectedMonthNumber = Number(selectedMonth.split("-")[1]);
    const today = new Date();
    const annotations: Record<number, string> = {};
    let currentWeekIndex: number | null = null;

    // Check week 1 to week 5.
    for (let week = 1; week <= 5; week++) {
      const { start, end } = getWeekPeriodClient(
        selectedYear,
        selectedMonthNumber,
        week
      );
      // Skip weeks that don't fall in the selected month.
      if (start.getMonth() + 1 !== selectedMonthNumber) continue;
      if (today >= start && today <= end) {
        currentWeekIndex = week;
      }
    }

    if (currentWeekIndex !== null) {
      // Annotate current week if the next week still belongs to the same month.
      const { start: nextWeekStart } = getWeekPeriodClient(
        selectedYear,
        selectedMonthNumber,
        currentWeekIndex + 1
      );
      if (nextWeekStart.getMonth() + 1 === selectedMonthNumber) {
        annotations[currentWeekIndex] = " (Current)";
        if (currentWeekIndex - 1 >= 1) {
          annotations[currentWeekIndex - 1] = " (Previous)";
        }
      }
    }

    setWeekAnnotations(annotations);
  }, [selectedMonth]);

  // Fetch data on component mount and whenever fetchAggregates changes.
  useEffect(() => {
    fetchAggregates();
  }, [fetchAggregates]);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-6">
      {/* Period Controls */}
      <div className="max-w-xl mx-auto mb-6 p-4 border rounded-lg shadow bg-white dark:bg-bg-800">
        <label className="block text-lg font-semibold mb-2 text-center">
          Select Period
        </label>

        {/* Period Type Buttons */}
        <div className="grid grid-cols-2 md:flex md:justify-between gap-2">
          {periodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setPeriodType(type)}
              className={`py-2 px-3 text-sm md:text-base rounded-lg transition ${
                periodType === type
                  ? "bg-highlight text-white"
                  : "bg-gray-200 dark:bg-bg-700 text-text-primary hover:bg-highlight hover:text-white"
              }`}
            >
              {type === "month"
                ? "Month"
                : type === "specificWeek"
                ? "Specific Week"
                : "Current Week"}
            </button>
          ))}
        </div>

        {/* Month Selection */}
        {(periodType === "month" || periodType === "specificWeek") && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-bg-900 text-text-primary"
            />
          </div>
        )}

        {/* Week Selection */}
        {periodType === "specificWeek" && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">
              Select Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full p-2 border rounded-lg bg-white dark:bg-bg-900 text-text-primary"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {`Week ${num}${weekAnnotations[num] || ""}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={fetchAggregates}
          className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : "Show Data"}
        </button>
      </div>

      {/* Aggregates Table / Cards */}
      <div className="max-w-4xl mx-auto">
        {isMobile ? (
          // Mobile View: Display as Cards
          <div className="space-y-4">
            {employeeData.map((emp) => (
              <div
                key={emp.id}
                className="p-4 border rounded-lg shadow bg-white dark:bg-bg-800"
              >
                <h3 className="text-lg font-semibold">{emp.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Shifts: {emp.shiftCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Hours: {emp.totalHours.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Desktop View: Display as Table
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-bg-700 dark:bg-bg-700 text-text-primary">
                  <th className="px-4 py-2 border border-bg-600">
                    Employee Name
                  </th>
                  <th className="px-4 py-2 border border-bg-600">Shifts</th>
                  <th className="px-4 py-2 border border-bg-600">
                    Total Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeData.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-bg-600 dark:hover:bg-bg-600"
                  >
                    <td className="px-4 py-2 border border-bg-600">
                      {emp.name}
                    </td>
                    <td className="px-4 py-2 border border-bg-600">
                      {emp.shiftCount}
                    </td>
                    <td className="px-4 py-2 border border-bg-600">
                      {emp.totalHours.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
