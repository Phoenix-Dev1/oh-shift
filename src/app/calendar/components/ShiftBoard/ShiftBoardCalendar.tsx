"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../../types";

interface ShiftBoardCalendarProps {
  shifts: Shift[];
  onEventClick: (shift: Shift) => void;
  onEventDrop: (shift: Shift) => void;
  onEventResize: (shift: Shift) => void;
  onDateSelect: (start: Date, end: Date) => void;
}

const ShiftBoardCalendar: React.FC<ShiftBoardCalendarProps> = ({
  shifts,
  onEventClick,
  onEventDrop,
  onEventResize,
  onDateSelect,
}) => {
  const events = shifts.map((shift) => ({
    id: shift.id,
    title: shift.allDay
      ? shift.title || "All Day"
      : shift.employees.map((e) => e.name).join(", ") || "No assignments",
    start: shift.startTime,
    end: shift.endTime,
    allDay: shift.allDay,
    extendedProps: { ...shift },
    backgroundColor: shift.allDay ? "#f1f5f9" : "#e0e7ff",
    borderColor: shift.allDay ? "#e2e8f0" : "#c7d2fe",
    textColor: shift.allDay ? "#475569" : "#4338ca",
  }));

  return (
    <div className="bento-card overflow-hidden !p-0">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        events={events}
        selectable={true}
        editable={true}
        allDaySlot={true}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        select={(info) => onDateSelect(info.start, info.end)}
        eventClick={(info) => onEventClick(info.event.extendedProps as Shift)}
        eventDrop={(info) => {
          const shift = info.event.extendedProps as Shift;
          onEventDrop({
            ...shift,
            startTime: info.event.start!.toISOString(),
            endTime: info.event.end!.toISOString(),
          });
        }}
        eventResize={(info) => {
          const shift = info.event.extendedProps as Shift;
          onEventResize({
            ...shift,
            startTime: info.event.start!.toISOString(),
            endTime: info.event.end!.toISOString(),
          });
        }}
        themeSystem="standard"
        eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
        dayHeaderClassNames="text-slate-500 font-medium py-2 uppercase text-xs tracking-wider"
      />
    </div>
  );
};

export default ShiftBoardCalendar;
