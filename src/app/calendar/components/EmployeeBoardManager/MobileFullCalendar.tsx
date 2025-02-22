"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../../types";

interface MobileFullCalendarProps {
  shifts: Shift[];
  setHoverModalData: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; shift: Shift } | null>
  >;
  mapShiftsToEvents: (shifts: Shift[]) => EventInput[];
}

const MobileFullCalendar: React.FC<MobileFullCalendarProps> = ({
  shifts,
  setHoverModalData,
  mapShiftsToEvents,
}) => {
  return (
    <FullCalendar
      direction="rtl"
      headerToolbar={{
        left: "title", // Buttons on the left side
        center: "prev,next", // Title in the center
        right: "today", // View selection on the right
      }}
      // 🔹 Customize the Title Format
      titleFormat={{
        year: "numeric",
        month: "short",
      }}
      dayHeaderFormat={{
        weekday: "short",
        day: "numeric",
        month: "numeric",
        omitCommas: true,
      }}
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridDay"
      selectable={true}
      editable={true}
      locale="en-gb"
      // Set long press delays for mobile
      longPressDelay={500}
      eventLongPressDelay={500}
      selectLongPressDelay={500}
      eventClassNames={(info) => (info.event.allDay ? "all-day-event" : "")}
      // In dayGrid, the events will be rendered in a grid
      events={mapShiftsToEvents(shifts)}
      height="85vh"
      // In dayGrid view, you don't need slotMinTime/slotMaxTime
      eventMouseEnter={(info) => {
        const { event, jsEvent } = info;
        const shift = shifts.find((s) => s.id === event.id);
        if (shift) {
          setHoverModalData({
            shift,
            x: jsEvent.pageX,
            y: jsEvent.pageY,
          });
        }
      }}
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
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      eventMouseLeave={() => setHoverModalData(null)}
    />
  );
};

export default MobileFullCalendar;
