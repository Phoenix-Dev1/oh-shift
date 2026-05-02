"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shift } from "../../../types";
import { Users, Clock, CornerLeftUp } from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ShiftItemProps {
  shift: Shift;
  top: number;
  height: number;
  onClick: () => void;
  onResizeEnd?: (newEndTime: string) => void;
  isOverlay?: boolean;
  isClippedStart?: boolean;
  isClippedEnd?: boolean;
}

const formatName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

const ShiftItem: React.FC<ShiftItemProps> = ({
  shift,
  top,
  height: initialHeight,
  onClick,
  onResizeEnd,
  isOverlay = false,
  isClippedStart = false,
  isClippedEnd = false
}) => {
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: shift,
    disabled: isResizing
  });

  useEffect(() => {
    setCurrentHeight(initialHeight);
  }, [initialHeight]);

  // Phase 4: Custom Pointer Logic for Resizing
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    // Capture pointer to continue receiving events even if moved outside handle
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;

    const deltaY = e.clientY - startYRef.current;

    // Phase 4: Grid Snapping (30 mins = 32px since 1hr = 64px)
    // Snapping to 15-minute increments (16px) for higher precision
    const snappedDelta = Math.round(deltaY / 16) * 16;
    const newHeight = Math.max(32, startHeightRef.current + snappedDelta);

    if (newHeight !== currentHeight) {
      setCurrentHeight(newHeight);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return;

    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (onResizeEnd && currentHeight !== initialHeight) {
      const durationInMinutes = (currentHeight / 64) * 60;
      const newEndTime = addMinutes(parseISO(shift.startTime), durationInMinutes).toISOString();
      onResizeEnd(newEndTime);
    }
  };

  const style = {
    top: isOverlay ? 0 : `${top}px`,
    height: `${currentHeight}px`,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isResizing || isDragging ? 50 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={isResizing ? undefined : onClick}
      style={style}
      className={`absolute left-1 right-1 bg-white dark:bg-slate-900 shadow-sm transition-shadow overflow-hidden flex flex-col border-l-4 border-l-indigo-500 border-r border-r-slate-200 dark:border-r-slate-800 ${isClippedStart
          ? "rounded-t-none border-t-2 border-t-dashed border-t-slate-300 dark:border-t-slate-700"
          : "rounded-t-md border-t border-t-slate-200 dark:border-t-slate-800"
        } ${isClippedEnd
          ? "rounded-b-none border-b-0"
          : "rounded-b-md border-b border-b-slate-200 dark:border-b-slate-800"
        } ${isOverlay ? "relative w-full opacity-100 shadow-xl" : ""
        } ${isResizing ? "ring-2 ring-indigo-500 shadow-lg cursor-ns-resize z-50" : "hover:shadow-md cursor-grab active:cursor-grabbing"}`}
    >
      <div className="p-3 flex flex-col h-full select-none">
        {/* Phase 1: Title/Role Prominence */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
            {shift.title || "Standard Shift"}
          </p>
        </div>

        {/* Phase 3: Typographic / Icon Indication */}
        {isClippedStart ? (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <CornerLeftUp className="w-3 h-3" />
            <span>Continue from {format(parseISO(shift.startTime), "HH:mm")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2">
            <Clock className="w-3 h-3" />
            {format(parseISO(shift.startTime), "HH:mm")} - {format(parseISO(shift.endTime), "HH:mm")}
          </div>
        )}

        {/* Phase 2 & 3: Clean Name List */}
        {!isOverlay && shift.employees.length > 0 && currentHeight > 48 && (
          <div className="flex flex-col gap-1 mt-3 overflow-hidden">
            {shift.employees.slice(0, 4).map((emp) => (
              <div key={emp?.id || Math.random().toString()} className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                {formatName(emp?.name || "Unknown")}
              </div>
            ))}
            {shift.employees.length > 4 && (
              <div className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1">
                +{shift.employees.length - 4} more
              </div>
            )}
          </div>
        )}

        {/* Phase 4: Stable Resize Handle - Disabled if segment is clipped at the end */}
        {!isOverlay && !isClippedEnd && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group/handle"
          >
            <div className="w-6 h-1 bg-slate-100 dark:bg-slate-800 group-hover/handle:bg-indigo-500/30 rounded-full transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftItem;
