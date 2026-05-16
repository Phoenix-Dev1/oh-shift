"use client";

import React, { useMemo, useState } from "react";
import { 
  format, 
  isSameDay, 
  parseISO, 
  differenceInMinutes, 
  addMinutes, 
  startOfDay, 
  endOfDay, 
  isSameMonth,
  areIntervalsOverlapping,
  addHours,
  addDays
} from "date-fns";
import { 
  generateWeekDays, 
  generateMonthDays,
  calculateShiftPosition 
} from "../../libs/calendarUtils";
import { Shift } from "../../../types";
import ShiftItem from "./ShiftItem";
import DroppableCell from "./DroppableCell";
import { ViewMode } from "../../hooks/useShiftBoard";
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";

interface ShiftBoardCalendarProps {
  shifts: Shift[];
  viewMode: ViewMode;
  currentDate: Date;
  onEventClick: (shift: Shift) => void;
  onEventDrop: (shift: Shift) => void;
  onEventResize: (shift: Shift) => void;
  onEventDelete?: (shift: Shift) => void;
  onDateSelect: (start: Date, end: Date, allDay?: boolean) => void;
  businessDayStartHour?: number;
  isReadOnly?: boolean;
}

const ShiftBoardCalendar: React.FC<ShiftBoardCalendarProps> = ({
  shifts,
  viewMode,
  currentDate,
  onEventClick,
  onEventDrop,
  onEventResize,
  onEventDelete,
  onDateSelect,
  businessDayStartHour = 7,
  isReadOnly = false,
}) => {
  const baseDate = currentDate;
  
  const days = useMemo(() => {
    if (viewMode === 'day') return [baseDate];
    if (viewMode === 'month') return generateMonthDays(baseDate);
    return generateWeekDays(baseDate);
  }, [viewMode, baseDate]);

  // Phase 1: The Business Hours Array
  const BUSINESS_HOURS = useMemo(() => Array.from({ length: 24 }, (_, i) => (i + businessDayStartHour) % 24), [businessDayStartHour]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [selection, setSelection] = React.useState<{
    active: boolean;
    date: Date | null;
    startIndex: number;
    endIndex: number;
  }>({
    active: false,
    date: null,
    startIndex: -1,
    endIndex: -1
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (isReadOnly) return;
    const shift = event.active.data.current as Shift;
    setActiveShift(shift);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isReadOnly) return;
    setActiveShift(null);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const shift = active.data.current as Shift;
      const overId = over.id as string;
      
      // Handle All Day or Month Day Drops
      if (overId.startsWith("allday-") || overId.startsWith("monthday-")) {
        const dateStr = overId.replace("allday-", "").replace("monthday-", "");
        const newDate = startOfDay(parseISO(dateStr));
        onEventDrop({
          ...shift,
          startTime: newDate.toISOString(),
          endTime: endOfDay(newDate).toISOString(),
          allDay: true
        });
        return;
      }

      const newStartTime = parseISO(overId);
      const duration = differenceInMinutes(
        parseISO(shift.endTime),
        parseISO(shift.startTime)
      );
      
      const newEndTime = addMinutes(newStartTime, duration);
      
      onEventDrop({
        ...shift,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        allDay: false
      });
    }
  };

  const handlePointerDown = (date: Date, index: number) => {
    if (isReadOnly) return;
    setSelection({
      active: true,
      date,
      startIndex: index,
      endIndex: index
    });
  };

  const handlePointerEnter = (date: Date, index: number) => {
    if (isReadOnly) return;
    if (selection.active && selection.date && isSameDay(date, selection.date)) {
      setSelection(prev => ({ ...prev, endIndex: index }));
    }
  };

  React.useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (selection.active && selection.date) {
        const minIdx = Math.min(selection.startIndex, selection.endIndex);
        const maxIdx = Math.max(selection.startIndex, selection.endIndex);
        
        const startHour = BUSINESS_HOURS[minIdx];
        const endHour = BUSINESS_HOURS[maxIdx];

        let start = startOfDay(selection.date);
        if (startHour < businessDayStartHour) start = addDays(start, 1);
        start.setHours(startHour, 0, 0, 0);

        let end = startOfDay(selection.date);
        if (endHour < businessDayStartHour) end = addDays(end, 1);
        end.setHours(endHour + 1, 0, 0, 0);

        onDateSelect(start, end, false);
      }
      setSelection({ active: false, date: null, startIndex: -1, endIndex: -1 });
    };

    if (selection.active) {
      window.addEventListener("pointerup", handleGlobalPointerUp);
      window.addEventListener("pointercancel", handleGlobalPointerUp);
    }
    
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [selection, BUSINESS_HOURS, businessDayStartHour, onDateSelect]);

  // Helper to ensure robust date comparison regardless of exact time
  const isShiftOnDay = (shiftDateStr: string, dayDate: Date) => {
    return isSameDay(parseISO(shiftDateStr), dayDate);
  };

  // Month View Specific Rendering
  if (viewMode === 'month') {
    return (
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{d}</span>
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, baseDate);
              const dayShifts = shifts.filter(s => isShiftOnDay(s.startTime, day));
              
              return (
                <DroppableCell 
                  key={`monthday-${day.toISOString()}`}
                  id={`monthday-${day.toISOString()}`}
                  onClick={() => !isReadOnly && onDateSelect(startOfDay(day), endOfDay(day), true)}
                  className={`border-r border-b border-slate-100 dark:border-slate-800 p-2 flex flex-col gap-1 transition-colors min-h-0 ${
                    !isReadOnly ? "hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer" : "cursor-default"
                  } ${
                    !isCurrentMonth ? "opacity-30 bg-slate-50/50 dark:bg-slate-900/50" : ""
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isSameDay(day, new Date()) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayShifts.slice(0, 3).map(s => (
                      <div 
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(s); }}
                        className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 truncate cursor-pointer hover:border-indigo-500/50 transition-all"
                      >
                        {s.title || "Shift"}
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <span className="text-[8px] font-black text-slate-400 pl-1">+{dayShifts.length - 3} more</span>
                    )}
                  </div>
                </DroppableCell>
              );
            })}
          </div>
        </div>
        <DragOverlay>
          {activeShift ? (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xl border border-indigo-400 transform scale-105">
              {activeShift.title || "Moving Shift..."}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // Day/Week View Rendering
  const gridColsClass = viewMode === 'day' ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,1fr)]";

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[800px] ${selection.active ? "touch-none select-none" : ""}`}>
        {/* Grid Header */}
        <div className={`grid ${gridColsClass} border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 sticky top-0 z-20 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent`}>
          <div className="p-4 border-r border-slate-200 dark:border-slate-800" />
          {days.map((day) => (
            <div 
              key={day.toISOString()} 
              className="p-4 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0"
            >
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {format(day, "EEE")}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {format(day, "MMM d")}
              </p>
            </div>
          ))}
        </div>

        {/* All Day Row */}
        <div className={`grid ${gridColsClass} border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10 min-h-[56px] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent`}>
          <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">All</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">Day</span>
          </div>
          {days.map((day) => (
            <DroppableCell 
              key={`allday-${day.toISOString()}`} 
              id={`allday-${day.toISOString()}`}
              className={`relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 p-1.5 flex flex-col gap-1 min-h-[56px] transition-colors ${!isReadOnly ? "hover:bg-indigo-500/5 cursor-pointer" : "cursor-default"}`}
              onClick={() => {
                if (isReadOnly) return;
                const start = startOfDay(day);
                const end = endOfDay(day);
                onDateSelect(start, end, true);
              }}
            >
              {shifts
                .filter((s) => {
                  const opStart = startOfDay(day);
                  const opEnd = addDays(opStart, 1);
                  
                  const overlap = areIntervalsOverlapping(
                    { start: parseISO(s.startTime), end: parseISO(s.endTime) },
                    { start: opStart, end: opEnd }
                  );
                  return s.allDay === true && overlap;
                })
                .map((s) => (
                  <div 
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(s);
                    }}
                    className="px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span className="truncate uppercase tracking-tighter">{s.title || "Global Event"}</span>
                    <div className="w-1 h-1 rounded-full bg-indigo-500 shrink-0 ml-1.5" />
                  </div>
                ))}
            </DroppableCell>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-scroll relative bg-grid-slate-100 dark:bg-grid-slate-800/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className={`grid ${gridColsClass} min-h-full`}>
            {/* Time Column */}
            <div className="border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 sticky left-0 z-10">
              {BUSINESS_HOURS.map((hour) => (
                <div key={hour} className="h-16 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                    {hour}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day) => (
              <div 
                key={day.toISOString()} 
                className="relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 h-full"
              >
                {/* Ghost Selection Overlay */}
                {selection.active && selection.date && isSameDay(day, selection.date) && (
                  <div 
                    className="absolute left-1 right-1 bg-indigo-500/20 dark:bg-indigo-500/30 border-2 border-indigo-500/50 rounded-xl pointer-events-none z-40 transition-all duration-75"
                    style={{
                      top: `${Math.min(selection.startIndex, selection.endIndex) * 64}px`,
                      height: `${(Math.abs(selection.endIndex - selection.startIndex) + 1) * 64}px`
                    }}
                  >
                    <div className="p-3">
                      <div className="h-4 w-24 bg-indigo-500/30 rounded mb-2 animate-pulse"></div>
                      <div className="h-3 w-16 bg-indigo-500/20 rounded opacity-50 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Droppable Slots */}
                {BUSINESS_HOURS.map((hour) => {
                  let cellDate = startOfDay(day);
                  
                  // Phase 3: Droppable Zone Alignment
                  // If hour is before businessDayStartHour, it technically belongs to the next calendar day
                  if (hour < businessDayStartHour) {
                    cellDate = addDays(cellDate, 1);
                  }
                  
                  cellDate.setHours(hour, 0, 0, 0);
                  
                    return (
                      <DroppableCell 
                        key={cellDate.toISOString()} 
                        id={cellDate.toISOString()}
                        onClick={() => {
                          if (isReadOnly) return;
                          const end = new Date(cellDate);
                          end.setHours(BUSINESS_HOURS[BUSINESS_HOURS.indexOf(hour)] + 1);
                          onDateSelect(cellDate, end, false);
                        }}
                        onPointerDown={() => handlePointerDown(day, BUSINESS_HOURS.indexOf(hour))}
                        onPointerEnter={() => handlePointerEnter(day, BUSINESS_HOURS.indexOf(hour))}
                        className={!isReadOnly ? "cursor-crosshair" : "cursor-default"}
                      />
                    );
                })}

                {/* Shifts - Filtered by Logical Day bounds */}
                {(() => {
                  const dayShifts = shifts.filter((shift) => {
                    const opStart = addHours(startOfDay(day), businessDayStartHour);
                    const opEnd = addHours(opStart, 24);
                    
                    const overlap = areIntervalsOverlapping(
                      { start: parseISO(shift.startTime), end: parseISO(shift.endTime) },
                      { start: opStart, end: opEnd }
                    );
                    return overlap && shift.allDay !== true;
                  });

                  // Phase 1: Overlap Calculation Engine
                  const sortedShifts = [...dayShifts].sort((a, b) => 
                    parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
                  );

                  const clusters: Shift[][] = [];
                  sortedShifts.forEach(shift => {
                    let placed = false;
                    for (const cluster of clusters) {
                      const overlaps = cluster.some(s => 
                        areIntervalsOverlapping(
                          { start: parseISO(s.startTime), end: parseISO(s.endTime) },
                          { start: parseISO(shift.startTime), end: parseISO(shift.endTime) }
                        )
                      );
                      if (overlaps) {
                        cluster.push(shift);
                        placed = true;
                        break;
                      }
                    }
                    if (!placed) clusters.push([shift]);
                  });

                  const processedShifts: (Shift & { overlapCount: number; overlapIndex: number })[] = [];
                  const colIdxMap = new Map<string, number>();
                  clusters.forEach(cluster => {
                    const columns: Shift[][] = [];
                    cluster.forEach(shift => {
                      let colIdx = 0;
                      while (true) {
                        if (!columns[colIdx]) {
                          columns[colIdx] = [shift];
                          break;
                        }
                        const overlapsInCol = columns[colIdx].some(s => 
                          areIntervalsOverlapping(
                            { start: parseISO(s.startTime), end: parseISO(s.endTime) },
                            { start: parseISO(shift.startTime), end: parseISO(shift.endTime) }
                          )
                        );
                        if (!overlapsInCol) {
                          columns[colIdx].push(shift);
                          break;
                        }
                        colIdx++;
                      }
                      colIdxMap.set(shift.id, colIdx);
                    });
                    const overlapCount = columns.length;
                    cluster.forEach(shift => {
                      processedShifts.push({
                        ...shift,
                        overlapCount,
                        overlapIndex: colIdxMap.get(shift.id) || 0
                      });
                    });
                  });

                  return processedShifts.map((shift, dayIndex) => {
                    const pos = calculateShiftPosition(shift.startTime, shift.endTime, day, businessDayStartHour);
                    if (!pos) return null;
                    
                    return (
                      <ShiftItem 
                        key={`${shift.id}-${day.toISOString()}`}
                        shift={shift}
                        top={pos.top}
                        height={pos.height}
                        isClippedStart={pos.isClippedStart}
                        isClippedEnd={pos.isClippedEnd}
                        overlapCount={shift.overlapCount}
                        overlapIndex={shift.overlapIndex}
                        colorIndex={dayIndex}
                        isReadOnly={isReadOnly}
                        onClick={() => onEventClick(shift)}
                        onResizeEnd={(newEndTime: string) => onEventResize({
                          ...shift,
                          endTime: newEndTime
                        })}
                        onDelete={() => onEventDelete?.(shift)}
                      />
                    );
                  });
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeShift ? (
          <ShiftItem 
            shift={activeShift} 
            top={0} 
            height={activeShift.allDay ? 40 : calculateShiftPosition(activeShift.startTime, activeShift.endTime, baseDate, businessDayStartHour)?.height || 64}
            onClick={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ShiftBoardCalendar;
