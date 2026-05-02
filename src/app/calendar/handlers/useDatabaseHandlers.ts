// src\app\calendar\handlers\useDatabaseHandlers.ts
import { toast } from "sonner";
import { Shift } from "../../types/index";

// Define the shape of a shift returned from the API
interface Assignment {
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
        allDay: shift.allDay,
        title: shift.title,
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
      payload.allDay = shift.allDay;
      payload.title = shift.title;
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
      allDay: shift.allDay,
      title: shift.title,
      managerId: "",
      employees:
        shift.assignments?.map((assignment: Assignment) => ({
          id: assignment.employee?.id ?? "unknown",
          name: assignment.employee?.name ?? "Unnamed",
          email: assignment.employee?.email ?? null,
          phone: assignment.employee?.phone ?? null,
          position: assignment.employee?.position ?? "Unknown",
          managerId: assignment.employee?.managerId ?? "",
          employeeManagerId: assignment.employee?.employeeManagerId ?? null,
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
