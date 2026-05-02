"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableCellProps {
  id: string;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ id, onClick, children, className }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Default time-slot class
  const defaultClass = "h-16 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 transition-colors";

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`${className || defaultClass} ${
        isOver ? "bg-indigo-500/10 dark:bg-indigo-500/20" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default DroppableCell;
