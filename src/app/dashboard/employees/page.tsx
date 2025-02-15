// src/app/dashboard/employees/page.tsx

"use client";

import { useState, useEffect } from "react";
import { getEmployees } from "../../actions/getEmployees";
import { editEmployee } from "../../actions/editEmployee";
import { deleteEmployee } from "../../actions/deleteEmployee";
import { toast } from "react-toastify";

type Employee = {
  id: string;
  name: string;
  position?: string;
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  // Fetch employees on load
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updated = await editEmployee(editingEmployee.id, name, position);
    if (updated) {
      toast.success("Employee updated successfully!");
      fetchEmployees();
      setEditingEmployee(null);
    } else {
      toast.error("Failed to update employee.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const success = await deleteEmployee(id);
      if (success) {
        toast.success("Employee deleted.");
        fetchEmployees();
      } else {
        toast.error("Failed to delete employee.");
      }
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setName(employee.name);
    setPosition(employee.position || "");
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-text-secondary">
        Manage Employees
      </h1>

      {/* Employee List */}
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Position</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {employee.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {employee.position || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Position</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
