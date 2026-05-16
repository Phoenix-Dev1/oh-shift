"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Employee } from "../../../../types/index";
import ManagerInfo from "../../components/ManagerInfo";
import DashboardSkeleton from "../../components/DashboardSkeleton";
import { Search, Users, UserPlus, CheckCircle2 } from "lucide-react";

export default function CalendarSharePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Default to true
  const [managerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/");
      const data = await response.json();
      setEmployees(data);
    } catch {
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
    } catch {
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
    } catch {
      toast.error("Error unassigning manager.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search term (by email)
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  );

  const assignedEmployees = filteredEmployees.filter((e) => e.employeeManagerId);
  const unassignedEmployees = filteredEmployees.filter((e) => !e.employeeManagerId);

  const sectionHeader = (title: string, count: number, colorClass: string) => (
    <div className="flex items-center gap-4 mb-8 mt-12 first:mt-0">
      <div className={`h-8 w-1 ${colorClass} rounded-full`} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        {title}
        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
          {count}
        </span>
      </h2>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Calendar Share</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium leading-relaxed">
            Manage who can view your team&apos;s schedule. Assigned employees have active visibility controlled by their manager.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-16 pb-20">
          {/* Unassigned Section */}
          {unassignedEmployees.length > 0 && (
            <section>
              {sectionHeader("Needs Assignment", unassignedEmployees.length, "bg-amber-500")}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unassignedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                          {employee.email || "No email available"}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-500/10 rounded-xl">
                        <Users className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => assignManager(employee.id)}
                        className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Manager
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Assigned Section */}
          {assignedEmployees.length > 0 && (
            <section>
              {sectionHeader("Active Connections", assignedEmployees.length, "bg-emerald-500")}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                          {employee.email || "No email available"}
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <ManagerInfo managerId={employee.employeeManagerId!} />
                      </div>
                    </div>

                    <button
                      onClick={() => unassignManager(employee.id)}
                      className="w-full px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm active:scale-95"
                    >
                      Unassign Manager
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">We couldn&apos;t find any employees matching &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
