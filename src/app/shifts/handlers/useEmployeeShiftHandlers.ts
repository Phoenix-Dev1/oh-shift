import { toast } from "react-toastify";
import { Shift } from "../../types/index";

export const fetchEmployeeShifts = async (
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  try {
    const response = await fetch("/api/shifts/employee");
    if (!response.ok) throw new Error("Failed to load employee shifts");

    const shiftsFromDB = await response.json();
    const dbShifts: Shift[] = shiftsFromDB.map((shift: any) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      allDay: shift.allDay,
      title: shift.title,
      employees:
        shift.assignments?.map((assignment: any) => ({
          id: assignment.employee?.id ?? "unknown",
          name: assignment.employee?.name ?? "Unnamed",
          position: assignment.employee?.position ?? "Unknown",
        })) ?? [],
    }));

    setShifts(dbShifts);
  } catch (error) {
    console.error("Error fetching employee shifts:", error);
    toast.error("Failed to load employee shifts.");
  }
};
