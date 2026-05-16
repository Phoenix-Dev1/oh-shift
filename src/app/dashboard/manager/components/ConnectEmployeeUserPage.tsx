"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getEmployees } from "../../../actions/getEmployees";
import { getManagerUsers } from "../../../actions/getManagerUsers";
import {
  getEmployeeAssignments,
  EmployeeAssignment,
} from "../../../actions/getEmployeeAssignments";
import DashboardSkeleton from "./DashboardSkeleton";
import { User, Users, Link as LinkIcon, Trash2, Search, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

type Employee = {
  id: string;
  name: string;
};

type ManagerUser = {
  id: string;
  email: string;
};

const ConnectEmployeeUserPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managerUsers, setManagerUsers] = useState<ManagerUser[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagerUser | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emps = await getEmployees();
        const users = await getManagerUsers();
        const assigns = await getEmployeeAssignments();
        setEmployees(emps);
        setManagerUsers(users);
        setAssignments(assigns);
      } catch (error) {
        toast.error("Error fetching data: " + error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAssignmentForEmployee = (employeeId: string) =>
    assignments.find((assign) => assign.employeeId === employeeId);

  const getAssignmentForUser = (userId: string) =>
    assignments.find((assign) => assign.user.id === userId);

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedUser) return;
    try {
      const response = await fetch("/api/manager/assignEmployeeUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          userId: selectedUser.id,
        }),
      });
      if (response.ok) {
        toast.success("Connection established successfully!");
        const emps = await getEmployees();
        const users = await getManagerUsers();
        const assigns = await getEmployeeAssignments();
        setEmployees(emps);
        setManagerUsers(users);
        setAssignments(assigns);
        setSelectedEmployee(null);
        setSelectedUser(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Assignment failed.");
      }
    } catch {
      toast.error("Error during assignment.");
    }
  };

  const handleUnassign = async (employeeId: string) => {
    try {
      const response = await fetch("/api/manager/unassignEmployeeUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (response.ok) {
        toast.success("Connection removed successfully.");
        const emps = await getEmployees();
        const users = await getManagerUsers();
        const assigns = await getEmployeeAssignments();
        setEmployees(emps);
        setManagerUsers(users);
        setAssignments(assigns);
      } else {
        const data = await response.json();
        toast.error(data.error || "Unassignment failed.");
      }
    } catch {
      toast.error("Error during unassignment.");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  const filteredManagerUsers = managerUsers.filter((user) =>
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleUserClick = (user: ManagerUser) => {
    const assignment = getAssignmentForUser(user.id);
    if (assignment && (!selectedEmployee || assignment.employeeId !== selectedEmployee.id)) {
      return;
    }
    setSelectedUser(user);
  };

  if (loading) return <DashboardSkeleton />;

  const cardBase = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[500px]";
  const labelStyle = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 block";
  const inputWrapper = "relative mb-4";
  const inputStyle = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Access Control & Mapping</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
          Link system users to employee profiles to enable personalized shift views.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employees Column */}
        <div className={cardBase}>
          <span className={labelStyle}>1. Select Employee</span>
          <div className={inputWrapper}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredEmployees.map((emp) => {
              const assign = getAssignmentForEmployee(emp.id);
              const isSelected = selectedEmployee?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={clsx(
                    "p-3 rounded-xl cursor-pointer transition-all border",
                    isSelected 
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/30" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className={clsx("text-sm font-bold", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300")}>
                      {emp.name}
                    </span>
                    {assign && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  {assign && (
                    <p className="text-[10px] text-slate-500 mt-1 font-medium italic truncate">{assign.user.email}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Users Column */}
        <div className={cardBase}>
          <span className={labelStyle}>2. Select System User</span>
          <div className={inputWrapper}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredManagerUsers.map((user) => {
              const assignment = getAssignmentForUser(user.id);
              const isDisabled = assignment && (!selectedEmployee || assignment.employeeId !== selectedEmployee.id);
              const isSelected = selectedUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => !isDisabled && handleUserClick(user)}
                  className={clsx(
                    "p-3 rounded-xl transition-all border",
                    isDisabled ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-950 border-transparent" : "cursor-pointer",
                    isSelected 
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30" 
                      : !isDisabled && "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className={clsx("w-3.5 h-3.5", isSelected ? "text-emerald-600" : "text-slate-400")} />
                    <span className={clsx("text-sm font-medium truncate", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>
                      {user.email}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Column */}
        <div className={clsx(cardBase, "bg-slate-50 dark:bg-slate-950/50")}>
          <span className={labelStyle}>3. Finalize Connection</span>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            {!selectedEmployee ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-200 dark:border-slate-800">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium px-6">Select an employee from the first column to begin.</p>
              </div>
            ) : (
              <div className="w-full space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Selection</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</span>
                    </div>
                    <LinkIcon className="w-4 h-4 text-indigo-500" />
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-[150px] truncate">
                      <span className="text-sm font-bold text-slate-900 dark:text-white italic">
                        {selectedUser ? selectedUser.email.split('@')[0] : "???"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  {selectedEmployee && !getAssignmentForEmployee(selectedEmployee.id) && selectedUser ? (
                    <button
                      onClick={handleAssign}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Create Connection
                    </button>
                  ) : selectedEmployee && getAssignmentForEmployee(selectedEmployee.id) ? (
                    <button
                      onClick={() => handleUnassign(selectedEmployee.id)}
                      className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Break Connection
                    </button>
                  ) : (
                    <div className="py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-400 font-medium italic">Pending User Selection...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-medium">Mapped users will only see shifts assigned to their linked profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectEmployeeUserPage;
