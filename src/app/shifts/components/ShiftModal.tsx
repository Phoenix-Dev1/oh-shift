"use client";

import React, { useState } from "react";
import { Phone, Info } from "lucide-react"; // npm install lucide-react

interface Employee {
  id: string;
  name: string;
  phone?: string;
  position?: string;
}

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { employees: Employee[] }) => void;
  employees: Employee[];
  shift: { employees: Employee[] };
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  shift,
}) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    shift?.employees?.map((emp) => emp.id) || []
  );
  const [visiblePhones, setVisiblePhones] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  // Group employees by position
  const groupEmployeesByPosition = () => {
    const grouped: { [key: string]: Employee[] } = {};
    employees.forEach((emp) => {
      const position = emp.position || "No Position";
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(emp);
    });

    // Sort employees alphabetically within each group
    Object.keys(grouped).forEach((position) => {
      grouped[position].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  // Toggle employee selection
  const handleToggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Toggle phone number visibility
  const handleTogglePhone = (id: string) => {
    setVisiblePhones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Save selected employees
  const handleSave = () => {
    const selectedEmployees = employees.filter((emp) =>
      selectedEmployeeIds.includes(emp.id)
    );
    onSave({ employees: selectedEmployees });
  };

  if (!isOpen) return null;

  const groupedEmployees = groupEmployeesByPosition();

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-lg font-bold mb-4">Assign Employees</h2>

        {/* Employee Columns by Position */}
        <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {Object.entries(groupedEmployees).map(([position, employees]) => (
            <div key={position} className="bg-gray-100 p-3 rounded-lg">
              <h3 className="text-md font-bold mb-2 text-center">{position}</h3>
              <div className="space-y-2">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      selectedEmployeeIds.includes(emp.id)
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-200"
                    }`}
                    onClick={() => handleToggleEmployee(emp.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{emp.name}</p>

                      {/* Show Phone Number OR Phone Icon */}
                      {visiblePhones[emp.id] ? (
                        // Click on number to hide it and show icon
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePhone(emp.id);
                          }}
                          className="px-2 py-1 text-sm text-gray-800 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                        >
                          {emp.phone ? emp.phone : "No phone"}
                        </button>
                      ) : (
                        // Click on icon to show number or Tooltip for no phone
                        <>
                          {emp.phone ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePhone(emp.id);
                              }}
                              className="p-1 rounded-full hover:bg-gray-300 transition"
                              title="Show phone number"
                            >
                              <Phone size={16} className="text-gray-800" />
                            </button>
                          ) : (
                            <div
                              className="relative"
                              onMouseEnter={() => setTooltipVisible(emp.id)}
                              onMouseLeave={() => setTooltipVisible(null)}
                            >
                              <Info size={16} className="text-gray-400" />
                              {tooltipVisible === emp.id && (
                                <div className="absolute left-6 bottom-1 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg">
                                  No phone available
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
