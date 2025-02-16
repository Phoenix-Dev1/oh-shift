// src/handlers/useShiftHandlers.ts
import { Shift } from "../types";
import { toast } from "react-toastify";

export const handleDateSelect = (
  selectInfo: any,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const newShift: Shift = {
    id: crypto.randomUUID(),
    startTime: selectInfo.startStr,
    endTime: selectInfo.endStr,
    employees: [],
  };
  setShifts([...shifts, newShift]);
  toast.success("Shift created. Click to assign employees.");
};

export const handleEventClick = (
  clickInfo: any,
  shifts: Shift[],
  setSelectedShift: React.Dispatch<React.SetStateAction<Shift | null>>,
  setIsShiftModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const shift = shifts.find((s) => s.id === clickInfo.event.id);
  if (shift) {
    setSelectedShift(shift);
    setIsShiftModalOpen(true);
  }
};

export const handleEventDrop = (
  dropInfo: any,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const { event } = dropInfo;
  setShifts(
    shifts.map((shift) =>
      shift.id === event.id
        ? {
            ...shift,
            startTime: event.start?.toISOString() || shift.startTime,
            endTime: event.end?.toISOString() || shift.endTime,
          }
        : shift
    )
  );
  toast.info("Shift moved successfully.");
};

export const handleEventResize = (
  resizeInfo: any,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const { event } = resizeInfo;
  setShifts(
    shifts.map((shift) =>
      shift.id === event.id
        ? { ...shift, endTime: event.end?.toISOString() || shift.endTime }
        : shift
    )
  );
  toast.info("Shift resized successfully.");
};
