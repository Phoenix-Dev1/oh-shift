// src/components/CustomFullCalendar.tsx
"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../types";
import {
  handleDateSelect,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
} from "../handlers/useShiftHandlers";
import { handleEventDidMount } from "../handlers/useDeleteHandlers";

interface CustomFullCalendarProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  setSelectedShift: React.Dispatch<React.SetStateAction<Shift | null>>;
  setIsShiftModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShiftToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHoverModalData: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; shift: Shift } | null>
  >;
  mapShiftsToEvents: (shifts: Shift[]) => any[];
}

const CustomFullCalendar: React.FC<CustomFullCalendarProps> = ({
  shifts,
  setShifts,
  setSelectedShift,
  setIsShiftModalOpen,
  setIsDeleteModalOpen,
  setShiftToDelete,
  setHoverModalData,
  mapShiftsToEvents,
}) => {
  return (
    <FullCalendar
      direction="rtl"
      allDaySlot={true}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={true}
      editable={true}
      locale="en-gb"
      eventClassNames={(info) => (info.event.allDay ? "all-day-event" : "")}
      dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
      events={mapShiftsToEvents(shifts)}
      select={(selectInfo) => handleDateSelect(selectInfo, shifts, setShifts)}
      eventClick={(clickInfo) =>
        handleEventClick(
          clickInfo,
          shifts,
          setSelectedShift,
          setIsShiftModalOpen
        )
      }
      eventDrop={(dropInfo) => handleEventDrop(dropInfo, shifts, setShifts)}
      eventResize={(resizeInfo) =>
        handleEventResize(resizeInfo, shifts, setShifts)
      }
      eventDidMount={(info) =>
        handleEventDidMount(info, setShiftToDelete, setIsDeleteModalOpen)
      }
      height="85vh"
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
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
      eventMouseLeave={() => setHoverModalData(null)}
    />
  );
};

export default CustomFullCalendar;
