// src/components/CustomFullCalendar.tsx
"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Clock, Layout } from "lucide-react";
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
      eventClassNames={(info) => {
        const classes = ["transition-all duration-200 border-none rounded-lg shadow-sm"];
        if (info.event.allDay) {
          classes.push("bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-4 border-l-emerald-500 hover:bg-emerald-500/20");
        } else {
          classes.push("bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-l-indigo-500 hover:bg-indigo-500/20");
        }
        return classes.join(" ");
      }}
      dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
      events={mapShiftsToEvents(shifts)}
      eventContent={(info) => {
        const start = info.event.start
          ? new Date(info.event.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          : "";
        const end = info.event.end
          ? new Date(info.event.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          : "";

        return (
          <div className="p-1.5 h-full flex flex-col justify-center gap-0.5 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <div className={info.event.allDay ? "text-emerald-500" : "text-indigo-500"}>
                {info.event.allDay ? <Layout size={12} /> : <Clock size={12} />}
              </div>
              <span className="text-[11px] font-black uppercase tracking-tight">
                {info.event.allDay ? "All Day" : `${start} - ${end}`}
              </span>
            </div>
            <div className="text-[13px] font-bold truncate leading-none">
              {info.event.title}
            </div>
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
