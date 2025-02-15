// app/shifts/components/DroppableShift.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";

interface ShiftProps {
  shift: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    assignedTo: string | null;
  };
}

const DroppableShift: React.FC<ShiftProps> = ({ shift }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: shift.id,
    data: { type: "SHIFT", shift },
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded shadow text-center transition flex flex-col justify-center ${
        isOver ? "bg-blue-300" : "bg-white dark:bg-gray-600"
      }`}
    >
      <p className="font-semibold">
        {shift.startTime} - {shift.endTime}
      </p>
      <p className="text-gray-500">
        {shift.assignedTo ? `Assigned: ${shift.assignedTo}` : "Unassigned"}
      </p>
    </div>
  );
};

export default DroppableShift;
