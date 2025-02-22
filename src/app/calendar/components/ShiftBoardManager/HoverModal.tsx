// src\app\calendar\components\ShiftBoardManager\HoverModal.tsx

"use client";

import React from "react";

interface HoverModalProps {
  x: number;
  y: number;
  startTime: string;
  endTime: string;
  employees: { name: string; position: string }[];
  isVisible: boolean;
}

const HoverModal: React.FC<HoverModalProps> = ({
  x,
  y,
  startTime,
  endTime,
  employees,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-bg-800 border border-border-primary rounded-lg shadow-lg p-4 text-text-primary"
      style={{
        top: `${y + 10}px`,
        left: `${x + 10}px`,
        minWidth: "250px",
      }}
    >
      <h3 className="text-lg font-bold text-highlight mb-2">Shift Details</h3>
      <p className="text-sm text-text-secondary">
        🕒 {startTime} - {endTime}
      </p>
      <p className="text-sm text-text-secondary font-semibold mt-2">
        Employees:
      </p>
      {employees.length > 0 ? (
        <ul className="list-disc pl-4 text-sm text-text-primary">
          {employees.slice(0, 5).map((emp, index) => (
            <li key={index}>
              <span className="font-semibold">{emp.name}</span> - {emp.position}
            </li>
          ))}
          {employees.length > 5 && (
            <li className="text-xs text-text-secondary">
              + {employees.length - 5} more...
            </li>
          )}
        </ul>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          No employees assigned
        </p>
      )}
    </div>
  );
};

export default HoverModal;
