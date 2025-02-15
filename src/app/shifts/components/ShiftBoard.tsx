// app/shifts/components/ShiftBoard.tsx
"use client";

import { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Button from "../../components/Button";
import ShiftModal from "./ShiftModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Employee {
  id: string;
  name: string;
}
interface Shift {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  assignedTo: string[];
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
  const [selectedDay, setSelectedDay] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const addEmployee = () => {
    if (!employeeName.trim()) {
      toast.warning("Employee name cannot be empty!");
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = employees.some(
      (emp) => emp.name.toLowerCase() === employeeName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Employee with this name already exists!");
      return;
    }

    // Add the new employee
    setEmployees([
      ...employees,
      { id: crypto.randomUUID(), name: employeeName.trim() },
    ]);
    toast.success("Employee added successfully!");
    setEmployeeName("");
  };

  const addShift = (startTime: string, endTime: string) => {
    setShifts([
      ...shifts,
      {
        id: crypto.randomUUID(),
        day: selectedDay,
        startTime,
        endTime,
        assignedTo: [],
      },
    ]);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const draggedEmployee = employees.find((emp) => emp.id === active.id);
    if (draggedEmployee) {
      setShifts(
        shifts.map((shift) =>
          shift.id === over.id &&
          !shift.assignedTo.includes(draggedEmployee.name)
            ? {
                ...shift,
                assignedTo: [...shift.assignedTo, draggedEmployee.name],
              }
            : shift
        )
      );
    }
  };

  const DraggableEmployee = ({ employee }: { employee: Employee }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: employee.id,
    });
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="bg-highlight text-white dark:bg-highlight p-2 rounded shadow cursor-grab"
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        }}
      >
        {employee.name}
      </div>
    );
  };

  const DroppableShift = ({ shift }: { shift: Shift }) => {
    const { setNodeRef, isOver } = useDroppable({ id: shift.id });
    return (
      <div
        ref={setNodeRef}
        className={`p-2 border rounded ${
          isOver ? "bg-highlight text-white" : "bg-bg-800 text-text-primary"
        } dark:bg-bg-700 dark:text-text-secondary`}
      >
        <div className="font-bold">
          {shift.startTime} - {shift.endTime}
        </div>
        <div className="mt-2 space-y-1">
          {shift.assignedTo.length > 0 ? (
            shift.assignedTo.map((name, index) => (
              <div
                key={index}
                className="bg-bg-600 text-text-primary dark:bg-bg-800 dark:text-text-secondary p-1 rounded text-sm"
              >
                {name}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Unassigned</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={addShift}
      />

      <div className="flex flex-col gap-4">
        <div className="flex-1 grid grid-cols-7 gap-4">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold">{day}</h3>
              <Button
                onClick={() => {
                  setSelectedDay(day);
                  setIsShiftModalOpen(true);
                }}
              >
                Add Shift
              </Button>
              {shifts
                .filter((shift) => shift.day === day)
                .map((shift) => (
                  <DroppableShift key={shift.id} shift={shift} />
                ))}
            </div>
          ))}
        </div>
        {/* Add Employees */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col w-2/5 p-4 items-center justify-center text-center bg-gray-200 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Employees</h2>
            <input
              type="text"
              placeholder="Employee name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <Button onClick={addEmployee} fullWidth>
              Add Employee
            </Button>
            <div className="mt-4 grid grid-cols-5 gap-4">
              {employees.map((emp) => (
                <DraggableEmployee key={emp.id} employee={emp} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ShiftBoard;
