import { toast } from "sonner";
import { Shift } from "../../types/index";

interface EmployeeFromAssignment {
  id: string;
  name: string;
  position: string;
  employeeManagerId: string;
}

interface Assignment {
  employee?: EmployeeFromAssignment | null;
}

interface ShiftAPIResponse {
  id: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  title: string;
  assignments?: Assignment[];
}

export const fetchEmployeeShifts = async (
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
): Promise<void> => {
  try {
    const response = await fetch("/api/shifts/employee");
    if (!response.ok) throw new Error("Failed to load employee shifts");

    const shiftsFromDB: ShiftAPIResponse[] = await response.json();
    const dbShifts: Shift[] = shiftsFromDB.map((shift: ShiftAPIResponse) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      allDay: shift.allDay,
      title: shift.title,
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
      "Error fetching employee shifts:",
      error instanceof Error ? error.message : error
    );
    toast.error("Failed to load employee shifts.");
  }
};
