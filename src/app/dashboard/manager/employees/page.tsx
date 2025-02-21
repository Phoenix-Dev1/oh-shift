"use client";

import { useState, useEffect } from "react";
import { getEmployees } from "../../../actions/getEmployees";
import { editEmployee } from "../../../actions/editEmployee";
import { deleteEmployee } from "../../../actions/deleteEmployee";
import { deleteAssignedShifts } from "../../../actions/deleteAssignedShifts";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import CreateEmployeeForm from "../components/CreateEmployeeForm";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeleteModal from "../../../calendar/components/ShiftBoardManager/DeleteModal";
import useIsMobile from "../../../hooks/useIsMobile";

// Extended type with shiftCount (provided by your API)
type Employee = {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  createdAt?: string;
  shiftCount?: number; // number of shifts currently assigned
};

export default function EmployeesPage() {
  const isMobile = useIsMobile();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Modal state for employee deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Modal state for assigned shifts deletion confirmation
  const [isAssignedDeleteModalOpen, setIsAssignedDeleteModalOpen] =
    useState(false);
  const [employeeToDeleteShifts, setEmployeeToDeleteShifts] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  // Optimistically add the employee with a temporary id.
  const handleOptimisticAdd = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  // New callback to update the optimistic employee with the real DB employee.
  const handleEmployeeCreated = (tempId: string, realEmployee: Employee) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) => (emp.id === tempId ? realEmployee : emp))
    );
    if (editingEmployee?.id === tempId) {
      setEditingEmployee(realEmployee);
    }
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

  const openDeleteModal = (id: string) => {
    setEmployeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    handleOptimisticRemove(employeeToDelete);

    const success = await deleteEmployee(employeeToDelete);
    if (success) {
      toast.success("Employee deleted.");
    } else {
      toast.error("Failed to delete employee. Reverting changes.");
      fetchEmployees();
    }

    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  // Open confirmation modal for deleting assigned shifts.
  const openDeleteAssignedShiftsModal = (employeeId: string) => {
    setEmployeeToDeleteShifts(employeeId);
    setIsAssignedDeleteModalOpen(true);
  };

  const handleConfirmDeleteAssignedShifts = async () => {
    if (!employeeToDeleteShifts) return;
    const success = await deleteAssignedShifts(employeeToDeleteShifts);
    if (success) {
      toast.success("All assigned shifts deleted successfully.");
      fetchEmployees(); // Refresh to update shiftCount, etc.
    } else {
      toast.error("Failed to delete assigned shifts.");
    }
    setIsAssignedDeleteModalOpen(false);
    setEmployeeToDeleteShifts(null);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setName(employee.name);
    setPhone(employee.phone || "");
    setPosition(employee.position || "");
  };

  return (
    <div className="flex h-screen bg-bg-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-900 text-text-primary">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
          Manage Employees
        </h1>

        {/* Add Employee Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-5 py-2 text-base md:text-lg font-semibold bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
          >
            {showCreateForm ? "Close Form" : "Add Employee"}
          </button>
        </div>

        {/* Create Employee Form */}
        {showCreateForm && (
          <div className="mb-6">
            <CreateEmployeeForm
              onOptimisticAdd={handleOptimisticAdd}
              onEmployeeCreated={handleEmployeeCreated}
            />
          </div>
        )}

        {/* Employee List */}
        {employees.length === 0 ? (
          <p className="text-center">No employees found.</p>
        ) : isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 bg-bg-800 rounded-lg shadow-md border border-bg-700"
              >
                <h2 className="text-lg font-semibold">{employee.name}</h2>
                <p className="text-sm text-text-secondary">
                  Position: {employee.position || "N/A"}
                </p>
                <p className="text-sm text-text-secondary">
                  Phone: {employee.phone || "N/A"}
                </p>

                <div className="mt-3 flex gap-2 justify-center">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  {employee.shiftCount && employee.shiftCount > 0 ? (
                    <button
                      onClick={() => openDeleteAssignedShiftsModal(employee.id)}
                      className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Delete All Assigned Shifts
                    </button>
                  ) : (
                    <button
                      onClick={() => openDeleteModal(employee.id)}
                      className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                <tr key={employee.id} className="hover:bg-bg-800">
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.position || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.phone || "N/A"}
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEditModal(employee)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    {employee.shiftCount && employee.shiftCount > 0 ? (
                      <button
                        onClick={() =>
                          openDeleteAssignedShiftsModal(employee.id)
                        }
                        className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Delete All Assigned Shifts
                      </button>
                    ) : (
                      <button
                        onClick={() => openDeleteModal(employee.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modals */}
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

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
          }}
          onConfirm={handleDelete}
          title="Delete Employee"
          message="Are you sure you want to delete this employee?"
        />

        <DeleteModal
          isOpen={isAssignedDeleteModalOpen}
          onClose={() => {
            setIsAssignedDeleteModalOpen(false);
            setEmployeeToDeleteShifts(null);
          }}
          onConfirm={handleConfirmDeleteAssignedShifts}
          title="Delete All Assigned Shifts"
          message="Are you sure you want to delete all shift assignments for this employee? If they are the only one assigned to a shift, that shift will also be deleted."
        />
      </main>
    </div>
  );
}
