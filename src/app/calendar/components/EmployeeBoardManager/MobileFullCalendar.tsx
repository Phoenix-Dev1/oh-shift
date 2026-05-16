"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import { Clock, Layout } from "lucide-react";
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
      selectable={false}
      editable={false}
      locale="en-gb"
      // Set long press delays for mobile
      longPressDelay={500}
      eventLongPressDelay={500}
      selectLongPressDelay={500}
      eventClassNames={(info) => {
        const classes = ["transition-all duration-200 border-none rounded-lg shadow-sm"];
        if (info.event.allDay) {
          classes.push("bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-4 border-l-emerald-500");
        } else {
          classes.push("bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-l-indigo-500");
        }
        return classes.join(" ");
      }}
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
          <div className="p-1 h-full flex flex-col justify-center gap-0.5 overflow-hidden">
            <div className="flex items-center gap-1">
              <div className={info.event.allDay ? "text-emerald-500" : "text-indigo-500"}>
                {info.event.allDay ? <Layout size={10} /> : <Clock size={10} />}
              </div>
              <span className="text-[10px] font-black tracking-tight">
                {info.event.allDay ? "All Day" : `${start} - ${end}`}
              </span>
            </div>
            <div className="text-[11px] font-bold truncate leading-none">
              {info.event.title}
            </div>
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
