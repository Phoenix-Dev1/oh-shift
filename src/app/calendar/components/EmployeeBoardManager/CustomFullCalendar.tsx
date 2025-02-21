// src/components/CustomFullCalendar.tsx
"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../../types";

interface CustomFullCalendarProps {
  shifts: Shift[];
  setHoverModalData: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; shift: Shift } | null>
  >;
  mapShiftsToEvents: (shifts: Shift[]) => EventInput[]; // Corrected type
}

const CustomFullCalendar: React.FC<CustomFullCalendarProps> = ({
  shifts,
  setHoverModalData,
  mapShiftsToEvents,
}) => {
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  return (
    <FullCalendar
      headerToolbar={{
        left: "title", // Buttons on the left side
        center: "prev,next today", // Title in the center
        right: "timeGridDay,timeGridWeek", // View selection on the right
      }}
      // 🔹 Customize the Title Format
      titleFormat={{
        year: "numeric",
        month: "short",
      }}
      direction="rtl"
      allDaySlot={true}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={false} // Disable selecting time slots
      editable={false} // Disable drag-and-drop
      droppable={false} // Disable external drag-and-drop
      eventStartEditable={false} // Disable event resizing
      eventDurationEditable={false} // Disable event duration changes
      locale="en-gb"
      eventClassNames={(info) => (info.event.allDay ? "all-day-event" : "")}
      dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
      events={mapShiftsToEvents(shifts)}
      eventContent={(info) => {
        if (info.event.allDay) {
          return (
            <div style={{ direction: "ltr", textAlign: "left" }}>
              <div>{info.event.title}</div>
            </div>
          );
        }
        const start = info.event.start
          ? new Date(info.event.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        const end = info.event.end
          ? new Date(info.event.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return (
          <div style={{ direction: "ltr", textAlign: "left" }}>
            <div className="text-md font-bold">
              {start} - {end}
            </div>
            <div className="text-gray-800">{info.event.title}</div>
          </div>
        );
      }}
      height="85vh"
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      eventMouseEnter={(info) => {
        const timeout = setTimeout(() => {
          const { event, jsEvent } = info;
          const shift = shifts.find((s) => s.id === event.id);
          if (shift) {
            setHoverModalData({
              shift,
              x: jsEvent.pageX,
              y: jsEvent.pageY,
            });
          }
        }, 2000); // 2-second delay

        setHoverTimeout(timeout);
      }}
      eventMouseLeave={() => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setHoverModalData(null);
      }}
    />
  );
};

export default CustomFullCalendar;
