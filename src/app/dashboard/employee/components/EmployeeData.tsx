"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Employee {
  id: string;
  name: string;
  position?: string;
  phone?: string;
}

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  title?: string;
}

interface ShiftSummary {
  totalShifts: number;
  totalHours: number;
}

export default function EmployeeData() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        const res = await fetch("/api/employees/shifts"); // Calls the API action
        if (!res.ok) throw new Error("Failed to load employee details");

        const data: { employee: Employee; upcomingShifts: Shift[] } =
          await res.json();
        setEmployee(data.employee);
        setUpcomingShifts(data.upcomingShifts);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Error fetching employee data");
        } else {
          toast.error("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeeData();
  }, []);

  useEffect(() => {
    async function fetchShiftSummary() {
      try {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth() + 1;

        const res = await fetch(
          `/api/employees/shifts?year=${year}&month=${month}`
        );
        if (!res.ok) throw new Error("Failed to fetch shift summary");

        const data: { shiftSummary: ShiftSummary } = await res.json();
        setShiftSummary(data.shiftSummary || { totalShifts: 0, totalHours: 0 });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Error fetching shift summary");
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
    fetchShiftSummary();
  }, [selectedMonth]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!employee) return <p className="text-center">Employee not found.</p>;

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      {/* Employee Details */}
      <div className="max-w-xl mx-auto bg-white dark:bg-bg-800 p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">{employee.name}</h1>
        <p className="text-lg text-text-secondary">
          📌 Position: {employee.position || "N/A"}
        </p>
        <p className="text-lg text-text-secondary">
          📞 Phone: {employee.phone || "N/A"}
        </p>
      </div>

      {/* Upcoming Shifts */}
      <div className="max-w-xl mx-auto mt-6 p-6 bg-white dark:bg-bg-800 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upcoming Shifts</h2>
        {upcomingShifts.length > 0 ? (
          <ul className="space-y-3">
            {upcomingShifts.map((shift, index) => {
              const startDate = new Date(shift.startTime);
              const endDate = new Date(shift.endTime);

              // Format day name and date (Saturday - 22.2.2025)
              const dayName = new Intl.DateTimeFormat("en-GB", {
                weekday: "long",
              }).format(startDate);
              const formattedDate = `${startDate.getDate()}.${
                startDate.getMonth() + 1
              }.${startDate.getFullYear()}`;

              // Format times (6:00 - 12:30)
              const startTime = startDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = endDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <li
                  key={shift.id}
                  className="p-3 border rounded-lg bg-gray-100 dark:bg-bg-700"
                >
                  <p className="text-md font-semibold">
                    Shift #{index + 1} - {dayName} - {formattedDate}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ⏰ {startTime} - {endTime}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No upcoming shifts.</p>
        )}
      </div>

      {/* Shift Summary */}
      <div className="max-w-xl mx-auto mt-6 p-6 bg-white dark:bg-bg-800 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Shift Summary</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium">Select Month</label>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date as Date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="w-full p-2 border rounded bg-white dark:bg-bg-900 text-text-primary"
          />
        </div>

        {shiftSummary ? (
          <div>
            <p className="text-lg">
              📅 Total Shifts: {shiftSummary.totalShifts || 0}
            </p>
            <p className="text-lg">
              ⏳ Total Hours:{" "}
              {shiftSummary.totalHours
                ? shiftSummary.totalHours.toFixed(2)
                : "0.00"}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No shift data for selected month.
          </p>
        )}
      </div>
    </div>
  );
}
