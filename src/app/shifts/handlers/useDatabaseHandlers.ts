// src/handlers/useDatabaseHandlers.ts
import { toast } from "react-toastify";
import { Shift } from "../../types/index";

// Define the shape of a shift returned from the API
interface Assignment {
  employee?: {
    id: string;
    name: string;
    position: string;
    employeeManagerId: string;
  } | null;
}

interface ShiftAPIResponse {
  id: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  title: string | null;
  assignments?: Assignment[];
}

// Define the payload type for updating a shift
interface UpdateShiftPayload {
  id: string;
  startTime: string;
  endTime: string;
  employees?: string[];
  allDay?: boolean;
  title?: string | null;
}

export const saveShiftToDB = async (
  shift: Shift
): Promise<ShiftAPIResponse | void> => {
  try {
    const response = await fetch("/api/shifts/manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: shift.startTime,
        endTime: shift.endTime,
        employees: shift.employees.map((emp) => emp.id),
        allDay: shift.allDay, // <-- Add this
        title: shift.title, // <-- And this
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save shift: ${errorText}`);
    }

    const result: ShiftAPIResponse = await response.json();
    toast.success("Shift saved to database!");
    return result;
  } catch (error: unknown) {
    console.error(
      "Error saving shift:",
      error instanceof Error ? error.message : error
    );
    toast.error("Error saving shift to database.");
  }
};

export const updateShiftInDB = async (
  shift: Shift,
  timeOnly = false
): Promise<ShiftAPIResponse | void> => {
  try {
    const payload: UpdateShiftPayload = {
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
    };

    if (!timeOnly) {
      payload.employees = shift.employees.map((emp) => emp.id);
      payload.allDay = shift.allDay; // <-- Include for non-time-only updates
      payload.title = shift.title; // <-- Include for non-time-only updates
    }

    const response = await fetch("/api/shifts/manager", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update shift: ${errorText}`);
    }

    const result: ShiftAPIResponse = await response.json();
    toast.success("Shift updated in database!");
    return result;
  } catch (error: unknown) {
    console.error(
      "Error updating shift:",
      error instanceof Error ? error.message : error
    );
    toast.error("Error updating shift in database.");
  }
};

export const fetchShiftsFromDB = async (
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
): Promise<void> => {
  try {
    const response = await fetch("/api/shifts/manager");
    if (!response.ok) throw new Error("Failed to load shifts from database");

    const shiftsFromDB: ShiftAPIResponse[] = await response.json();
    const dbShifts: Shift[] = shiftsFromDB.map((shift) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      allDay: shift.allDay, // Add this line
      title: shift.title ?? undefined, // Convert null to undefined
      employees:
        shift.assignments?.map((assignment: Assignment) => ({
          id: assignment.employee?.id ?? "unknown",
          name: assignment.employee?.name ?? "Unnamed",
          position: assignment.employee?.position ?? "Unknown",
          employeeManagerId: assignment.employee?.employeeManagerId ?? "",
        })) ?? [],
    }));

    setShifts(dbShifts);
  } catch (error: unknown) {
    console.error(
      "Error fetching shifts:",
      error instanceof Error ? error.message : error
    );
    toast.error("Failed to load shifts.");
  }
};
