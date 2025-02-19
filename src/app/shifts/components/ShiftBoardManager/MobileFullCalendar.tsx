"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../../types";
import {
  handleDateSelect,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
} from "../../handlers/useShiftHandlers";
import { handleEventDidMount } from "../../handlers/useDeleteHandlers";

interface MobileFullCalendarProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  setSelectedShift: React.Dispatch<React.SetStateAction<Shift | null>>;
  setIsShiftModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShiftToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHoverModalData: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; shift: Shift } | null>
  >;
  mapShiftsToEvents: (shifts: Shift[]) => EventInput[];
}

const MobileFullCalendar: React.FC<MobileFullCalendarProps> = ({
  shifts,
  setShifts,
  setSelectedShift,
  setIsShiftModalOpen,
  setShiftToDelete,
  setIsDeleteModalOpen,
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
