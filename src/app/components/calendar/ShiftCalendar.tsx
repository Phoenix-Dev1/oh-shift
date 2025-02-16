// src/components/calendar/ShiftCalendar.tsx

"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import { toast } from "react-toastify";

interface CalendarShift {
  id: string;
  title: string;
  start: string;
  end: string;
  employeeName?: string;
  employeePosition?: string;
}

interface ShiftCalendarProps {
  shifts: CalendarShift[];
  onShiftAdd?: (shift: CalendarShift) => void;
  onShiftUpdate?: (shift: CalendarShift) => void;
  onShiftDelete?: (id: string) => void;
}

export default function ShiftCalendar({
  shifts,
  onShiftAdd,
  onShiftUpdate,
  onShiftDelete,
}: ShiftCalendarProps) {
  const [currentShifts, setCurrentShifts] = useState<CalendarShift[]>(shifts);

  // Handle shift creation
  const handleDateSelect = (selectInfo: any) => {
    const title = prompt("Enter shift title:");
    if (title) {
      const newShift = {
        id: crypto.randomUUID(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      };
      setCurrentShifts([...currentShifts, newShift]);
      onShiftAdd?.(newShift);
      toast.success("Shift added successfully!");
    }
    selectInfo.view.calendar.unselect();
  };

  // Handle event drag and drop
  const handleEventDrop = (dropInfo: any) => {
    const updatedShift = {
      id: dropInfo.event.id,
      title: dropInfo.event.title,
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
    };
    setCurrentShifts(
      currentShifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift
      )
    );
    onShiftUpdate?.(updatedShift);
    toast.info("Shift updated.");
  };

  // Handle event deletion (double-click)
  const handleEventClick = (clickInfo: any) => {
    if (
      confirm(`Are you sure you want to delete '${clickInfo.event.title}'?`)
    ) {
      const shiftId = clickInfo.event.id;
      setCurrentShifts(currentShifts.filter((shift) => shift.id !== shiftId));
      onShiftDelete?.(shiftId);
      toast.error("Shift deleted.");
    }
  };

  return (
    <div className="bg-bg-900 text-text-primary p-4 rounded-lg shadow-lg">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={currentShifts}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek",
        }}
        height="75vh"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        weekends={true}
        allDaySlot={false}
      />
    </div>
  );
}
