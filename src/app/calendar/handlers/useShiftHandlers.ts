// src/handlers/useShiftHandlers.ts
import { Shift, Employee } from "../../types";
import { updateShiftInDB, saveShiftToDB } from "./useDatabaseHandlers";
import { toast } from "sonner";

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
    email: string | null;
    phone: string | null;
    position: string | null;
    managerId: string;
    employeeManagerId: string | null;
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
    managerId: "",
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
            email: assignment.employee?.email || null,
            phone: assignment.employee?.phone || null,
            position: assignment.employee?.position || "Unknown",
            managerId: assignment.employee?.managerId || "",
            employeeManagerId: assignment.employee?.employeeManagerId || null,
          })) || [],
        isNew: false,
        allDay: isAllDay,
        title: persistedShift.title || (isAllDay ? "New All Day Shift" : ""),
        managerId: "",
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

  const shift = shifts.find((s) => s.id === shiftId);
  if (!shift) {
    toast.error("Shift not found.");
    return;
  }

  const updatedShift: Shift = {
    ...shift,
    startTime: event.start ? event.start.toISOString() : shift.startTime,
    endTime: event.end ? event.end.toISOString() : shift.endTime,
    employees: shift.employees || [],
  };

  setShifts((prevShifts) =>
    prevShifts.map((s) => (s.id === shiftId ? updatedShift : s))
  );
  toast.info("Shift moved locally... updating database.");

  try {
    const result = await updateShiftInDB(updatedShift, true);
    if (result) {
      let employees: Employee[] = shift.employees;
      if (
        result.assignments &&
        Array.isArray(result.assignments) &&
        result.assignments.length > 0
      ) {
        employees = result.assignments.map(
          (assignment: AssignmentResponse) => ({
            id: assignment.employee?.id || "unknown",
            name: assignment.employee?.name || "Unnamed",
            email: assignment.employee?.email || null,
            phone: assignment.employee?.phone || null,
            position: assignment.employee?.position || "Unknown",
            managerId: assignment.employee?.managerId || "",
            employeeManagerId: assignment.employee?.employeeManagerId || null,
          })
        );
      }

      const formattedShift: Shift = {
        ...shift,
        id: result.id,
        startTime: result.startTime,
        endTime: result.endTime,
        employees,
        allDay: result.allDay,
        title: result.title,
      };

      setShifts((prevShifts) =>
        prevShifts.map((s) => (s.id === shiftId ? formattedShift : s))
      );
    }
  } catch {
    toast.error("Failed to update shift in database.");
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
  return (
    Date.now().toString() + "-" + Math.random().toString(36).substring(2, 15)
  );
};
