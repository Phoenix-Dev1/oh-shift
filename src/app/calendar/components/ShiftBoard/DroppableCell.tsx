"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableCellProps {
  id: string;
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: (e: React.PointerEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ 
  id, 
  onClick, 
  onPointerDown,
  onPointerEnter,
  children, 
  className 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Default time-slot class
  const defaultClass = "h-16 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 transition-colors cursor-pointer";

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      className={`${className || defaultClass} ${
        isOver ? "bg-indigo-500/10 dark:bg-indigo-500/20" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default DroppableCell;
