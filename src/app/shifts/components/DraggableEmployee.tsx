// app/shifts/components/DraggableEmployee.tsx
"use client";

import { useDraggable } from "@dnd-kit/core";

interface EmployeeProps {
  employee: { id: string; name: string };
}

const DraggableEmployee: React.FC<EmployeeProps> = ({ employee }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id,
    data: { type: "EMPLOYEE", employee },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-2 bg-gray-100 z-50 dark:bg-gray-700 rounded shadow cursor-grab text-center"
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : "none",
      }}
    >
      {employee.name}
    </div>
  );
};

export default DraggableEmployee;
