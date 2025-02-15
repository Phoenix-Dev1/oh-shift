// app/shifts/components/ShiftBoard.tsx
"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Button from "../../components/Button";
import DraggableEmployee from "./DraggableEmployee";
import DroppableShift from "./DroppableShift";
import ShiftModal from "./ShiftModal";

interface Employee {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  assignedTo: string | null;
}

interface ShiftBoardProps {
  week: number;
  days: Date[];
}

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ShiftBoard: React.FC<ShiftBoardProps> = ({ week, days }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");

  // 🟡 Open Modal for Shift Creation
  const openShiftModal = (day: string) => {
    setSelectedDay(day);
    setIsShiftModalOpen(true);
  };

  // 🟠 Add Shift from Modal
  const addShift = (startTime: string, endTime: string) => {
    const newShift: Shift = {
      id: crypto.randomUUID(),
      day: selectedDay,
      startTime,
      endTime,
      assignedTo: null,
    };
    setShifts((prev) => [...prev, newShift]);
  };

  // 🟡 Add New Employee via Input
  const addEmployee = () => {
    const name = prompt("Enter Employee Name:");
    if (!name) return;
    const newEmployee: Employee = { id: crypto.randomUUID(), name };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  // 🟠 Delete Shift
  const removeShift = (shiftId: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
    }
  };

  // 🟢 Handle Drag-and-Drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const draggedEmployee = employees.find((emp) => emp.id === active.id);
    if (!draggedEmployee) return;

    setShifts((prev) =>
      prev.map((shift) =>
        shift.id === over.id
          ? { ...shift, assignedTo: draggedEmployee.name }
          : shift
      )
    );
  };

  return (
    <>
      {/* Shift Modal Integration */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={addShift}
      />

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-4 p-4">
          {/* Employee Section */}
          <div className="w-1/5 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex flex-col p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Employees</h2>
            <Button onClick={addEmployee} fullWidth>
              Add Employee
            </Button>
            <div className="mt-4 flex-1 overflow-auto z-50">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <DraggableEmployee key={employee.id} employee={employee} />
                ))
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No employees yet
                </p>
              )}
            </div>
          </div>

          {/* Shift Board Section */}
          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex flex-col p-4">
            <h2 className="text-xl font-bold mb-4 text-center">
              Weekly Schedule (Week {week})
            </h2>

            {/* Grid for Days */}
            <div className="grid grid-cols-7 gap-4">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow flex flex-col"
                >
                  <h3 className="text-lg font-bold text-center mb-2">{day}</h3>

                  {/* 🟡 Add Shift Using Modal */}
                  <Button onClick={() => openShiftModal(day)} fullWidth>
                    Add Shift
                  </Button>

                  <div className="flex-1 overflow-auto mt-2 space-y-2">
                    {shifts
                      .filter((shift) => shift.day === day)
                      .map((shift) => (
                        <div
                          key={shift.id}
                          className="p-2 bg-white dark:bg-gray-600 rounded-lg flex justify-between items-center"
                        >
                          <DroppableShift shift={shift} />
                          <button
                            onClick={() => removeShift(shift.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </>
  );
};

export default ShiftBoard;
