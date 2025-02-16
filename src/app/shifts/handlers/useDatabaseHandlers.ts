// src/handlers/useDatabaseHandlers.ts
import { toast } from "react-toastify";
import { Shift } from "../types";

export const saveShiftToDB = async (shift: Shift) => {
  try {
    const response = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: shift.startTime,
        endTime: shift.endTime,
        employees: shift.employees.map((emp) => emp.id),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save shift: ${errorText}`);
    }

    const result = await response.json();
    toast.success("Shift saved to database!");
    return result;
  } catch (error: any) {
    console.error("Error saving shift:", error.message);
    toast.error("Error saving shift to database.");
  }
};

export const updateShiftInDB = async (shift: Shift, timeOnly = false) => {
  try {
    // Build payload:
    const payload: any = {
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
    };
    // If it's not a time-only update, include employees:
    if (!timeOnly) {
      payload.employees = shift.employees.map((emp) => emp.id);
    }
    const response = await fetch("/api/shifts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update shift: ${errorText}`);
    }

    const result = await response.json();
    toast.success("Shift updated in database!");
    return result;
  } catch (error: any) {
    console.error("Error updating shift:", error.message);
    toast.error("Error updating shift in database.");
  }
};

export const fetchShiftsFromDB = async (
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  try {
    const response = await fetch("/api/shifts");
    if (!response.ok) throw new Error("Failed to load shifts from database");

    const shiftsFromDB = await response.json();
    const dbShifts: Shift[] = shiftsFromDB.map((shift: any) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      employees:
        shift.assignments?.map((assignment: any) => ({
          id: assignment.employee?.id ?? "unknown",
          name: assignment.employee?.name ?? "Unnamed",
          position: assignment.employee?.position ?? "Unknown",
        })) ?? [],
    }));

    setShifts(dbShifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    toast.error("Failed to load shifts.");
  }
};
