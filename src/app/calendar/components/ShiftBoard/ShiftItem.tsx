"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shift } from "../../../types";
import { Clock, CornerLeftUp, Edit3, Trash2 } from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ShiftItemProps {
  shift: Shift;
  top: number;
  height: number;
  onClick: () => void;
  onResizeEnd?: (newEndTime: string) => void;
  onDelete?: () => void;
  isOverlay?: boolean;
  isClippedStart?: boolean;
  isClippedEnd?: boolean;
  overlapCount?: number;
  overlapIndex?: number;
  colorIndex?: number;
  isReadOnly?: boolean;
}

const formatName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

const STRIPE_COLORS = [
  '#0ea5e9', // Sky Blue
  '#10b981', // Emerald Green
  '#b6e1ecff', // White
  '#f43f5e', // Rose Red
  '#6366f1', // Indigo Purple
  '#f97316', // Orange
  '#d946ef', // Fuchsia Pink
];

const getStripeColor = (title: string | null | undefined = "Standard Shift", index: number = 0): string => {
  const normalizedTitle = title || "Standard Shift";
  const hash = normalizedTitle.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) * (i + 1)), 0);
  const colorIndex = Math.abs(hash * 31 + index * 17) % STRIPE_COLORS.length;
  return STRIPE_COLORS[colorIndex];
};

const ShiftItem: React.FC<ShiftItemProps> = ({
  shift,
  top,
  height: initialHeight,
  onClick,
  onResizeEnd,
  onDelete,
  isOverlay = false,
  isClippedStart = false,
  isClippedEnd = false,
  overlapCount = 1,
  overlapIndex = 0,
  colorIndex = 0,
  isReadOnly = false
}) => {
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: shift,
    disabled: isResizing || isReadOnly
  });

  useEffect(() => {
    setCurrentHeight(initialHeight);
  }, [initialHeight]);

  // Phase 4: Custom Pointer Logic for Resizing
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    // Capture pointer to continue receiving events even if moved outside handle
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing || isReadOnly) return;

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
    if (!isResizing || isReadOnly) return;

    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (onResizeEnd && currentHeight !== initialHeight) {
      const durationInMinutes = (currentHeight / 64) * 60;
      const newEndTime = addMinutes(parseISO(shift.startTime), durationInMinutes).toISOString();
      onResizeEnd(newEndTime);
    }
  };

  const stripeColor = getStripeColor(shift.title, colorIndex);

  const style = {
    top: isOverlay ? 0 : `${top}px`,
    height: `${currentHeight}px`,
    width: isOverlay ? "100%" : `calc(100% / ${overlapCount} - 4px)`,
    left: isOverlay ? "0" : `calc((100% / ${overlapCount}) * ${overlapIndex} + 2px)`,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isResizing || isDragging || isHovered ? 50 : 10,
    borderLeftColor: stripeColor,
  };

  return (
    <div
      ref={setNodeRef}
      {...(isReadOnly ? {} : listeners)}
      {...(isReadOnly ? {} : attributes)}
      onClick={isResizing ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
      className={`absolute group bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40 shadow-sm transition-all duration-200 ease-in-out overflow-hidden flex flex-col border-l-4 border-r border-r-indigo-100 dark:border-r-indigo-800/50 ${isClippedStart
        ? "rounded-t-none border-t-2 border-t-dashed border-t-indigo-200 dark:border-t-indigo-800/50"
        : "rounded-t-md border-t border-t-indigo-100 dark:border-t-indigo-800/50"
        } ${isClippedEnd
          ? "rounded-b-none border-b-0"
          : "rounded-b-md border-b border-b-indigo-100 dark:border-b-indigo-800/50"
        } ${isOverlay ? "relative w-full opacity-100 shadow-xl" : ""
        } ${isResizing ? "ring-2 ring-indigo-500 shadow-lg cursor-ns-resize z-50" : isReadOnly ? "hover:shadow-md cursor-pointer" : "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:z-50 cursor-grab active:cursor-grabbing"}`}
    >
      <div className="p-3 flex flex-col h-full select-none">
        {/* Phase 1: Title/Role Prominence */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-black text-indigo-950 dark:text-indigo-50 uppercase tracking-tight truncate">
            {shift.title || "Standard Shift"}
          </p>

          {/* Phase 2: Contextual Quick Action Bar */}
          {!isOverlay && !isReadOnly && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md shadow-sm p-1 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                title="Edit Shift"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                title="Delete Shift"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Phase 3: Typographic / Icon Indication */}
        {isClippedStart ? (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-medium whitespace-nowrap overflow-hidden">
            <CornerLeftUp className="w-3 h-3 shrink-0" />
            <span className="truncate">Cont. {format(parseISO(shift.startTime), "HH:mm")}</span>
          </div>
        ) : (
          <div className={`flex ${overlapCount > 1 ? 'flex-col gap-0.5' : 'items-center gap-1.5'} mb-2`}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700/80 dark:text-indigo-300/80 whitespace-nowrap">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{format(parseISO(shift.startTime), "HH:mm")}</span>
              {overlapCount === 1 && <span className="mx-0.5">-</span>}
            </div>
            {overlapCount > 1 ? (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700/80 dark:text-indigo-300/80 whitespace-nowrap opacity-70">
                <div className="w-3 shrink-0" /> {/* Alignment spacer */}
                <span>{format(parseISO(shift.endTime), "HH:mm")}</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-indigo-700/80 dark:text-indigo-300/80">
                {format(parseISO(shift.endTime), "HH:mm")}
              </span>
            )}
          </div>
        )}

        {/* Phase 2 & 3: Clean Name List */}
        {!isOverlay && shift.employees.length > 0 && currentHeight > 48 && (
          <div className="flex flex-col gap-1 mt-3 overflow-hidden">
            {[...shift.employees]
              .sort((a, b) => {
                if (a.id === shift.shiftLeadId) return -1;
                if (b.id === shift.shiftLeadId) return 1;
                return 0;
              })
              .slice(0, 8)
              .map((emp) => (
                <div
                  key={emp?.id || Math.random().toString()}
                  className={`text-xs font-medium truncate flex items-center gap-1 ${emp?.id === shift.shiftLeadId
                    ? "text-amber-700 dark:text-amber-300 font-bold"
                    : "text-indigo-900/70 dark:text-indigo-100/70"
                    }`}
                >
                  {emp?.id === shift.shiftLeadId && <span className="text-[10px]">⭐</span>}
                  {formatName(emp?.name || "Unknown")}
                </div>
              ))}
            {shift.employees.length > 8 && (
              <div className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1">
                +{shift.employees.length - 8} more
              </div>
            )}
          </div>
        )}

        {/* Phase 4: Stable Resize Handle - Disabled if segment is clipped at the end */}
        {!isOverlay && !isClippedEnd && !isReadOnly && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group/handle"
          >
            {/* Phase 3: Resize Handle Affordance */}
            <div className="w-8 h-1 bg-slate-300 dark:bg-slate-600 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-200" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftItem;
