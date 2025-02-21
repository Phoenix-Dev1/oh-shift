"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployees } from "../../../actions/getEmployees";
import { getManagerUsers } from "../../../actions/getManagerUsers";
import {
  getEmployeeAssignments,
  EmployeeAssignment,
} from "../../../actions/getEmployeeAssignments";
import InfinityLoader from "@/src/app/components/LoadingInfinity/InfinityLoader";

type Employee = {
  id: string;
  name: string;
  // Other employee fields…
};

type ManagerUser = {
  id: string;
  email: string;
  // Other user fields…
};

const ConnectEmployeeUserPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managerUsers, setManagerUsers] = useState<ManagerUser[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
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
        toast.error("Error fetching data:" + error);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };
    fetchData();
  }, []);

  // Helper: get assignment record for an employee
  const getAssignmentForEmployee = (employeeId: string) =>
    assignments.find((assign) => assign.employeeId === employeeId);

  // Helper: get assignment record for a manager user
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
        toast.success("Employee successfully assigned to user.");
        // Refresh data so assignments update
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
    } catch (error) {
      console.error("Assignment error:", error);
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
        toast.success("Employee successfully unassigned.");
        // Refresh data so assignments update
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
    } catch (error) {
      console.error("Unassignment error:", error);
      toast.error("Error during unassignment.");
    }
  };

  // Filter arrays based on search inputs
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  const filteredManagerUsers = managerUsers.filter((user) =>
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Custom click for manager user: if already assigned (to another employee), do nothing.
  const handleUserClick = (user: ManagerUser) => {
    const assignment = getAssignmentForUser(user.id);
    // If user is already assigned and either no employee is selected or assignment is to a different employee, disable selection.
    if (
      assignment &&
      (!selectedEmployee || assignment.employeeId !== selectedEmployee.id)
    ) {
      return;
    }
    setSelectedUser(user);
  };

  if (loading) {
    return <InfinityLoader />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Employee - User Connection</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-2">Employees</h2>
          <input
            type="text"
            placeholder="Search employees"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
          />
          <ul className="border rounded p-2">
            {filteredEmployees.map((emp) => {
              const assign = getAssignmentForEmployee(emp.id);
              return (
                <li
                  key={emp.id}
                  className={`p-2 cursor-pointer flex justify-between items-center ${
                    selectedEmployee?.id === emp.id ? "bg-blue-200" : ""
                  }`}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <span>{emp.name}</span>
                  {assign ? (
                    <span className="text-sm text-green-700">
                      {assign.user.email}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Not assigned</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {/* Manager's Users List */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <input
            type="text"
            placeholder="Search users"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
          />
          <ul className="border rounded p-2">
            {filteredManagerUsers.map((user) => {
              const assignment = getAssignmentForUser(user.id);
              // Disable selection if user is assigned to another employee.
              const isDisabled =
                assignment &&
                (!selectedEmployee ||
                  assignment.employeeId !== selectedEmployee.id);
              return (
                <li
                  key={user.id}
                  className={`p-2 cursor-pointer ${
                    selectedUser?.id === user.id ? "bg-green-200" : ""
                  } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!isDisabled) handleUserClick(user);
                  }}
                >
                  {user.email}{" "}
                  {isDisabled && <span className="text-xs">(Assigned)</span>}
                </li>
              );
            })}
          </ul>
        </div>
        {/* Actions */}
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          {selectedEmployee &&
            !getAssignmentForEmployee(selectedEmployee.id) &&
            selectedUser && (
              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Assign {selectedUser.email} to {selectedEmployee.name}
              </button>
            )}
          {selectedEmployee &&
            getAssignmentForEmployee(selectedEmployee.id) && (
              <button
                onClick={() => handleUnassign(selectedEmployee.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Unassign{" "}
                {getAssignmentForEmployee(selectedEmployee.id)?.user.email} from{" "}
                {selectedEmployee.name}
              </button>
            )}
          {!selectedEmployee && (
            <p className="text-gray-500">Select an employee to see actions</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <p>
          <strong>Selected Employee:</strong>{" "}
          {selectedEmployee ? selectedEmployee.name : "None"}
        </p>
        <p>
          <strong>Selected User:</strong>{" "}
          {selectedUser ? selectedUser.email : "None"}
        </p>
      </div>
    </div>
  );
};

export default ConnectEmployeeUserPage;
