"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface EmployeeAggregate {
  id: string;
  name: string;
  shiftCount: number;
  totalHours: number;
}

export default function EmployeeAggregatesPage() {
  // For period type selection: "month", "specificWeek", "currentWeek"
  const [periodType, setPeriodType] = useState<
    "month" | "specificWeek" | "currentWeek"
  >("month");
  // For month selection (format "YYYY-MM")
  const getCurrentMonth = (): string => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  // For specific week selection (1-indexed)
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const [employeeData, setEmployeeData] = useState<EmployeeAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAggregates = async () => {
    setLoading(true);
    try {
      let url = `/api/employees/dashboard`;
      if (periodType === "month") {
        // Entire Month: include year and month
        const [year, month] = selectedMonth.split("-");
        url += `?year=${year}&month=${month}`;
      } else if (periodType === "specificWeek") {
        // Specific Week: include year, month and week number
        const [year, month] = selectedMonth.split("-");
        url += `?year=${year}&month=${month}&week=${selectedWeek}`;
      }
      // For currentWeek, we do not pass any parameters so the backend uses the current week.
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch employee data");
      const data: EmployeeAggregate[] = await res.json();
      setEmployeeData(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error fetching employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregates();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      {/* Period Controls */}
      <div className="max-w-xl mx-auto mb-6 p-4 border rounded-lg shadow bg-white dark:bg-bg-800">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Choose Period
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="period"
                value="month"
                checked={periodType === "month"}
                onChange={() => setPeriodType("month")}
                className="form-radio"
              />
              <span className="ml-2">Entire Month</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="period"
                value="specificWeek"
                checked={periodType === "specificWeek"}
                onChange={() => setPeriodType("specificWeek")}
                className="form-radio"
              />
              <span className="ml-2">Specific Week</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="period"
                value="currentWeek"
                checked={periodType === "currentWeek"}
                onChange={() => setPeriodType("currentWeek")}
                className="form-radio"
              />
              <span className="ml-2">Current Week</span>
            </label>
          </div>
        </div>

        {(periodType === "month" || periodType === "specificWeek") && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-bg-900 text-text-primary"
            />
          </div>
        )}

        {periodType === "specificWeek" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Select Week (1 = first week)
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white dark:bg-bg-900 text-text-primary"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  Week {num}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={fetchAggregates}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : "Show Data"}
        </button>
      </div>

      {/* Aggregates Table */}
      <div className="overflow-x-auto max-w-4xl mx-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-bg-700 dark:bg-bg-700 text-text-primary">
              <th className="px-4 py-2 border border-bg-600">Employee Name</th>
              <th className="px-4 py-2 border border-bg-600">Shifts</th>
              <th className="px-4 py-2 border border-bg-600">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {employeeData.map((emp) => (
              <tr key={emp.id} className="hover:bg-bg-600 dark:hover:bg-bg-600">
                <td className="px-4 py-2 border border-bg-600">{emp.name}</td>
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
    </div>
  );
}
