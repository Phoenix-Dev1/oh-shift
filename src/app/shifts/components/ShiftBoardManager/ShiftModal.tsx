"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Info } from "lucide-react";
import { Shift, Employee } from "../../../types";
import useIsMobile from "../../../hooks/useIsMobile";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title?: string; employees?: Employee[] }) => void;
  onDelete?: () => void;
  shift?: Shift | null;
  employees: Employee[];
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  employees,
  shift,
}) => {
  const isMobile = useIsMobile();
  const [localTitle, setLocalTitle] = useState<string>(
    shift?.allDay ? shift.title || "" : ""
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    shift && !shift.allDay ? shift.employees?.map((emp) => emp.id) || [] : []
  );

  useEffect(() => {
    if (shift) {
      if (shift.allDay) {
        setLocalTitle(shift.title || "");
      } else {
        setSelectedEmployeeIds(shift.employees?.map((emp) => emp.id) || []);
      }
    }
  }, [shift]);

  const handleSave = () => {
    if (shift?.allDay) {
      onSave({ title: localTitle });
    } else {
      const selectedEmployees = employees.filter((emp) =>
        selectedEmployeeIds.includes(emp.id)
      );
      onSave({ employees: selectedEmployees });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-white dark:bg-bg-800 p-6 rounded-lg shadow-lg w-full ${
              isMobile ? "max-w-md" : "max-w-4xl"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {shift?.allDay ? (
              <>
                <h2 className="text-lg font-bold mb-4 text-center">
                  Edit All-Day Event
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-text-primary">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="mt-1 block w-full p-2 border rounded bg-white dark:bg-bg-900"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4 text-center">
                  Assign Employees
                </h2>
                <div
                  className={`overflow-y-auto ${
                    isMobile
                      ? "max-h-60 grid grid-cols-1 gap-2"
                      : "max-h-80 grid grid-cols-3 gap-4"
                  }`}
                >
                  {employees.map((emp) => (
                    <motion.div
                      key={emp.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        selectedEmployeeIds.includes(emp.id)
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-bg-800 hover:bg-gray-200 dark:hover:bg-gray-400 dark:hover:text-white"
                      }`}
                      onClick={() =>
                        setSelectedEmployeeIds((prev) =>
                          prev.includes(emp.id)
                            ? prev.filter((e) => e !== emp.id)
                            : [...prev, emp.id]
                        )
                      }
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{emp.name}</p>
                        {emp.phone ? (
                          <Phone size={16} className="text-gray-800" />
                        ) : (
                          <Info size={16} className="text-gray-700" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShiftModal;
