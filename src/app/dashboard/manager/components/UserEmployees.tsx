"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useIsMobile from "../../../hooks/useIsMobile";

interface EmployeeAggregate {
  id: string;
  name: string;
  shiftCount: number;
  totalHours: number;
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

  const fetchAggregates = async () => {
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
    } catch (error: any) {
      toast.error(error.message || "Error fetching employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregates();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-6">
      {/* Period Controls */}
      <div className="max-w-xl mx-auto mb-6 p-4 border rounded-lg shadow bg-white dark:bg-bg-800">
        <label className="block text-lg font-semibold mb-2 text-center">
          Select Period
        </label>

        {/* Period Type Buttons (Mobile Optimized) */}
        <div className="grid grid-cols-2 md:flex md:justify-between gap-2">
          {["month", "specificWeek", "currentWeek"].map((type) => (
            <button
              key={type}
              onClick={() => setPeriodType(type as any)}
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
                  Week {num}
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
          // 📌 Mobile View: Display as Cards
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
          // 📌 Desktop View: Display as Table
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
