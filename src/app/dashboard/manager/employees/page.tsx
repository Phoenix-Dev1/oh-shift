"use client";

import { useState, useEffect } from "react";
import { getEmployees } from "../../../actions/getEmployees";
import { editEmployee } from "../../../actions/editEmployee";
import { deleteEmployee } from "../../../actions/deleteEmployee";
import { deleteAssignedShifts } from "../../../actions/deleteAssignedShifts";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import CreateEmployeeForm from "../components/CreateEmployeeForm";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeleteModal from "../../../calendar/components/ShiftBoardManager/DeleteModal";
import useIsMobile from "../../../hooks/useIsMobile";
import { Plus, UserPlus, Users, Search, Filter, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Employee = {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  createdAt?: string;
  shiftCount?: number;
};

export default function EmployeesPage() {
  const isMobile = useIsMobile();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const [isAssignedDeleteModalOpen, setIsAssignedDeleteModalOpen] = useState(false);
  const [employeeToDeleteShifts, setEmployeeToDeleteShifts] = useState<string | null>(null);

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

  const handleEmployeeCreated = (tempId: string, realEmployee: Employee) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) => (emp.id === tempId ? realEmployee : emp))
    );
  };

  const handleOptimisticRemove = (id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updated = await editEmployee(editingEmployee.id, name, position, phone);
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
      toast.success("Employee deleted successfully.");
    } else {
      toast.error("Failed to delete employee. Reverting changes.");
      fetchEmployees();
    }
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const openDeleteAssignedShiftsModal = (employeeId: string) => {
    setEmployeeToDeleteShifts(employeeId);
    setIsAssignedDeleteModalOpen(true);
  };

  const handleConfirmDeleteAssignedShifts = async () => {
    if (!employeeToDeleteShifts) return;
    const success = await deleteAssignedShifts(employeeToDeleteShifts);
    if (success) {
      toast.success("Shift assignments cleared.");
      fetchEmployees();
    } else {
      toast.error("Failed to clear assignments.");
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

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Employee Directory
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                Manage your team members, their roles, and system access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-full md:w-64 text-slate-900 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
              >
                {showCreateForm ? <Plus className="w-4 h-4 rotate-45 transition-transform" /> : <UserPlus className="w-4 h-4" />}
                {showCreateForm ? "Close Form" : "Add Employee"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <CreateEmployeeForm
                  onOptimisticAdd={handleOptimisticAdd}
                  onEmployeeCreated={handleEmployeeCreated}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Container (Bento Box) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {filteredEmployees.length === 0 ? (
              <div className="p-20 text-center">
                <Users className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No team members found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Try adjusting your search or add a new employee.</p>
              </div>
            ) : isMobile ? (
              <div className="p-4 space-y-4">
                {filteredEmployees.map((employee) => (
                  <motion.div
                    layout
                    key={employee.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">{employee.name}</h2>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                          {employee.position || "Staff"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{employee.phone || "No phone"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        Edit
                      </button>
                      {employee.shiftCount && employee.shiftCount > 0 ? (
                        <button
                          onClick={() => openDeleteAssignedShiftsModal(employee.id)}
                          className="flex-1 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:opacity-80 transition-opacity"
                        >
                          Clear Shifts
                        </button>
                      ) : (
                        <button
                          onClick={() => openDeleteModal(employee.id)}
                          className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Employee</th>
                      <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Position</th>
                      <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Contact</th>
                      <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEmployees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                              {employee.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{employee.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {employee.position || "Member"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{employee.phone || "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(employee)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                            >
                              Edit
                            </button>
                            {employee.shiftCount && employee.shiftCount > 0 ? (
                              <button
                                onClick={() => openDeleteAssignedShiftsModal(employee.id)}
                                className="px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-all"
                              >
                                Clear Shifts
                              </button>
                            ) : (
                              <button
                                onClick={() => openDeleteModal(employee.id)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          {/* Fallback for touch devices or non-hover */}
                          <div className="flex group-hover:hidden items-center justify-end">
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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
          title="Delete Team Member"
          message="This will permanently remove the employee from the system. This action cannot be undone."
        />

        <DeleteModal
          isOpen={isAssignedDeleteModalOpen}
          onClose={() => {
            setIsAssignedDeleteModalOpen(false);
            setEmployeeToDeleteShifts(null);
          }}
          onConfirm={handleConfirmDeleteAssignedShifts}
          title="Clear Assignments"
          message="This employee is currently assigned to active shifts. Clearing assignments will remove them from the schedule but keep their profile active."
        />
      </main>
    </div>
  );
}
