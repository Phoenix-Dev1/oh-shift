"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Employee } from "../../../../types/index";

export default function CalendarSharePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [managerId, setManagerId] = useState("");

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employees.");
    } finally {
      setLoading(false);
    }
  };

  // Assign Manager
  const assignManager = async (employeeId: string) => {
    try {
      const response = await fetch("/api/users/assignManager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, managerId }),
      });

      if (response.ok) {
        toast.success("Manager assigned successfully!");
        fetchEmployees(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to assign manager.");
      }
    } catch (error) {
      toast.error("Error assigning manager.");
    }
  };

  // Unassign Manager
  const unassignManager = async (employeeId: string) => {
    try {
      const response = await fetch("/api/users/unassignManager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      if (response.ok) {
        toast.success("Manager unassigned successfully!");
        fetchEmployees(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to unassign manager.");
      }
    } catch (error) {
      toast.error("Error unassigning manager.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 bg-bg-full text-text-primary min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Calendar Share</h1>

      {/* Manager Input */}
      <div className="flex justify-center items-center mb-6">
        <input
          type="text"
          placeholder="Enter your Manager ID"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="p-2 border rounded-lg bg-bg-800 text-text-primary"
        />
      </div>

      {/* Employee List */}
      {loading ? (
        <p className="text-center text-lg">Loading employees...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-bg-700 p-4 rounded-lg shadow-lg border border-bg-600"
            >
              <h2 className="text-xl font-semibold">{employee.name}</h2>
              <p className="text-sm text-text-secondary">
                {employee.email || "No email available"}
              </p>
              <p className="text-sm">
                Current Manager ID:{" "}
                <span className="font-medium">
                  {employee.employeeManagerId || "None"}
                </span>
              </p>

              {/* Show only one button depending on assignment status */}
              {!employee.employeeManagerId ? (
                <button
                  onClick={() => assignManager(employee.id)}
                  className="mt-2 px-4 py-2 bg-highlight text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Assign Manager
                </button>
              ) : (
                <button
                  onClick={() => unassignManager(employee.id)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Unassign Manager
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
