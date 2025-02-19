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
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      eventMouseLeave={() => setHoverModalData(null)}
    />
  );
};

export default MobileFullCalendar;
