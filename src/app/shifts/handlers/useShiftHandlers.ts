// src/handlers/useShiftHandlers.ts
import { Shift } from "../types";
import { updateShiftInDB, saveShiftToDB } from "./useDatabaseHandlers";
import { toast } from "react-toastify";

export const handleDateSelect = async (
  selectInfo: any,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  // Create a new shift with a temporary id
  const tempShift: Shift = {
    id: crypto.randomUUID(),
    startTime: selectInfo.startStr,
    endTime: selectInfo.endStr,
    employees: [],
    isNew: true, // flag to indicate it's not yet persisted
  };

  // Optimistically update local state with the temporary shift
  setShifts([...shifts, tempShift]);
  toast.info("Creating new shift...");

  try {
    // Persist the new shift immediately
    const persistedShift = await saveShiftToDB(tempShift);
    if (persistedShift) {
      // Transform the persisted response to match your Shift type.
      const formattedShift: Shift = {
        id: persistedShift.id,
        startTime: persistedShift.startTime,
        endTime: persistedShift.endTime,
        employees:
          persistedShift.assignments?.map((assignment: any) => ({
            id: assignment.employee?.id || "unknown",
            name: assignment.employee?.name || "Unnamed",
            position: assignment.employee?.position || "Unknown",
          })) || [],
        isNew: false, // now it’s persisted
      };

      // Replace the temporary shift with the persisted shift (using the real id)
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === tempShift.id ? formattedShift : shift
        )
      );
      toast.success("Shift created successfully.");
    }
  } catch (error) {
    toast.error("Failed to create shift.");
    // Optionally, remove the temporary shift from local state
    setShifts((prevShifts) => prevShifts.filter((s) => s.id !== tempShift.id));
  }
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

export const handleEventDrop = async (
  dropInfo: any,
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
    startTime: event.start?.toISOString() || shift.startTime,
    endTime: event.end?.toISOString() || shift.endTime,
    // Preserve employees from local state
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
      // Check if the API result returned assignment data.
      // If not, merge the existing employees from local state.
      let employees = shift.employees;
      if (
        result.assignments &&
        Array.isArray(result.assignments) &&
        result.assignments.length > 0
      ) {
        employees = result.assignments.map((assignment: any) => ({
          id: assignment.employee?.id || "unknown",
          name: assignment.employee?.name || "Unnamed",
          position: assignment.employee?.position || "Unknown",
        }));
      }

      // Build a formatted shift preserving the employees.
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
  } catch (error) {
    toast.error("Failed to update shift in database.");
    // Optionally, revert the optimistic update by re-fetching shifts.
  }
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
