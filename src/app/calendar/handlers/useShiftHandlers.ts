// src/handlers/useShiftHandlers.ts
import { Shift } from "../../types";
import { updateShiftInDB, saveShiftToDB } from "./useDatabaseHandlers";
import { toast } from "react-toastify";

interface DateSelectInfo {
  startStr: string;
  endStr: string;
  allDay: boolean;
}

interface EventClickInfo {
  event: { id: string };
}

interface EventDropInfo {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
  };
}

interface EventResizeInfo {
  event: {
    id: string;
    end: Date | null;
  };
}

interface AssignmentResponse {
  employee?: {
    id: string;
    name: string;
    position: string;
    employeeManagerId: string;
  } | null;
}

export const handleDateSelect = async (
  selectInfo: DateSelectInfo,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const startDate = new Date(selectInfo.startStr);
  const endDate = new Date(selectInfo.endStr);
  const isAllDay =
    selectInfo.allDay ||
    (startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      endDate.getHours() === 0 &&
      endDate.getMinutes() === 0);

  const tempShift: Shift = {
    id: generateUUID(),
    startTime: selectInfo.startStr,
    endTime: selectInfo.endStr,
    employees: [],
    isNew: true,
    allDay: isAllDay,
    title: isAllDay ? "New All Day Shift" : "",
  };

  setShifts([...shifts, tempShift]);
  toast.info("Creating new shift...");

  try {
    const persistedShift = await saveShiftToDB(tempShift);
    if (persistedShift) {
      const formattedShift: Shift = {
        id: persistedShift.id,
        startTime: persistedShift.startTime,
        endTime: persistedShift.endTime,
        employees:
          persistedShift.assignments?.map((assignment: AssignmentResponse) => ({
            id: assignment.employee?.id || "unknown",
            name: assignment.employee?.name || "Unnamed",
            position: assignment.employee?.position || "Unknown",
            employeeManagerId: assignment.employee?.employeeManagerId || "",
          })) || [],
        isNew: false,
        allDay: isAllDay,
        title: persistedShift.title || (isAllDay ? "New All Day Shift" : ""),
      };

      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === tempShift.id ? formattedShift : shift
        )
      );
      toast.success("Shift created successfully.");
    }
  } catch {
    toast.error("Failed to create shift.");
    setShifts((prevShifts) => prevShifts.filter((s) => s.id !== tempShift.id));
  }
};
export const handleEventClick = (
  clickInfo: EventClickInfo,
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

export const handleEventDrop = async (
  dropInfo: EventDropInfo,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const { event } = dropInfo;
  const shiftId = event.id;

  // Find the shift in local state
  const shift = shifts.find((s) => s.id === shiftId);
  if (!shift) {
    toast.error("Shift not found.");
    return;
  }

  // Create an updated shift object with new start and end times;
  // keep the existing employees from local state.
  const updatedShift: Shift = {
    ...shift,
    startTime: event.start ? event.start.toISOString() : shift.startTime,
    endTime: event.end ? event.end.toISOString() : shift.endTime,
    employees: shift.employees || [],
  };

  // Optimistically update local state
  setShifts((prevShifts) =>
    prevShifts.map((s) => (s.id === shiftId ? updatedShift : s))
  );
  toast.info("Shift moved locally... updating database.");

  try {
    // Call updateShiftInDB with timeOnly = true so no employees payload is sent.
    const result = await updateShiftInDB(updatedShift, true);
    if (result) {
      let employees = shift.employees;
      if (
        result.assignments &&
        Array.isArray(result.assignments) &&
        result.assignments.length > 0
      ) {
        employees = result.assignments.map(
          (assignment: AssignmentResponse) => ({
            id: assignment.employee?.id || "unknown",
            name: assignment.employee?.name || "Unnamed",
            position: assignment.employee?.position || "Unknown",
            employeeManagerId: assignment.employee?.employeeManagerId || "",
          })
        );
      }

      const formattedShift: Shift = {
        id: result.id,
        startTime: result.startTime,
        endTime: result.endTime,
        employees,
      };

      // Update state with the formatted shift.
      setShifts((prevShifts) =>
        prevShifts.map((s) => (s.id === shiftId ? formattedShift : s))
      );
    }
  } catch {
    toast.error("Failed to update shift in database.");
    // Optionally, revert the optimistic update by re-fetching shifts.
  }
};

export const handleEventResize = (
  resizeInfo: EventResizeInfo,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const { event } = resizeInfo;
  setShifts(
    shifts.map((shift) =>
      shift.id === event.id
        ? {
            ...shift,
            endTime: event.end ? event.end.toISOString() : shift.endTime,
          }
        : shift
    )
  );
  toast.info("Shift resized successfully.");
};

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback: combine timestamp and random string
  return (
    Date.now().toString() + "-" + Math.random().toString(36).substring(2, 15)
  );
};
