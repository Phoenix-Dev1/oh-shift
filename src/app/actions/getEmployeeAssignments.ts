// src/actions/getEmployeeAssignments.ts

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const getEmployeeAssignments = async (): Promise<
  EmployeeAssignment[]
> => {
  try {
    const response = await fetch("/api/manager/employeeAssignments", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const assignments: EmployeeAssignment[] = await response.json();
    return assignments;
  } catch (error) {
    console.error("Failed to fetch employee assignments:", error);
    return [];
  }
};
