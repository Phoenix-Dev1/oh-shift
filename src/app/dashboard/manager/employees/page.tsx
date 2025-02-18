// src/app/dashboard/employees/page.tsx

"use client";

import { useState, useEffect } from "react";
import { getEmployees } from "../../../actions/getEmployees";
import { editEmployee } from "../../../actions/editEmployee";
import { deleteEmployee } from "../../../actions/deleteEmployee";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import CreateEmployeeForm from "../components/CreateEmployeeForm";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeleteModal from "../../../shifts/components/DeleteModal";

type Employee = {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  createdAt?: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Fetch employees on load
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const handleOptimisticAdd = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  const handleOptimisticRemove = (id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updated = await editEmployee(
      editingEmployee.id,
      name,
      position,
      phone
    );
    if (updated) {
      toast.success("Employee updated successfully!");
      fetchEmployees();
      setEditingEmployee(null);
    } else {
      toast.error("Failed to update employee.");
    }
  };

  // Open Delete Modal
  const openDeleteModal = (id: string) => {
    setEmployeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle Employee Deletion (Optimistic)
  const handleDelete = async () => {
    if (!employeeToDelete) return;

    // Optimistically remove the employee from the state
    handleOptimisticRemove(employeeToDelete);

    const success = await deleteEmployee(employeeToDelete);
    if (success) {
      toast.success("Employee deleted.");
    } else {
      toast.error("Failed to delete employee. Reverting changes.");
      fetchEmployees(); // Rollback to actual state from the server
    }

    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setName(employee.name);
    setPhone(employee.phone || "");
    setPosition(employee.position || "");
  };

  return (
    <div className="flex h-screen bg-bg-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-bg-900 text-text-primary">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Manage Employees
        </h1>

        {/* Centered Add Employee Button */}
        {!showCreateForm && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 text-lg font-semibold bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
            >
              Add Employee
            </button>
          </div>
        )}

        {/* Create Employee Form (Shown Only After Button Click) */}
        {showCreateForm && (
          <div className="mb-6">
            <CreateEmployeeForm onOptimisticAdd={handleOptimisticAdd} />

            {/* Centered Cancel Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        {employees.length === 0 ? (
          <p className="text-center">No employees found.</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-bg-700">
              <tr className="text-text-secondary">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Position</th>
                <th className="border border-gray-300 px-4 py-2">Phone</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className={`hover:bg-bg-800 ${
                    employee.id.startsWith("temp-") ? "opacity-60" : ""
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.position || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.phone || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEditModal(employee)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(employee.id)}
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

        {/* Edit Employee Modal */}
        <EditEmployeeModal
          employee={editingEmployee}
          name={name}
          position={position}
          phone={phone}
          setName={setName}
          setPosition={setPosition}
          setPhone={setPhone}
          onClose={() => setEditingEmployee(null)}
          onSave={handleEdit}
        />

        {/* Delete Employee Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Employee"
          message="Are you sure you want to delete this employee?"
        />
      </main>
    </div>
  );
}
