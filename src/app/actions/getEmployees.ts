// src/actions/getEmployees.ts

interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  position?: string;
  employeeManagerId: string | null;
  shiftCount?: number;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch("/api/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const employees: Employee[] = await response.json();

    // Ensure each employee has a shiftCount property (default to 0 if not provided)
    return employees.map((employee) => ({
      ...employee,
      shiftCount: employee.shiftCount ?? 0,
    }));
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};
