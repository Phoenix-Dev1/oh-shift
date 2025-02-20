// src/actions/getEmployees.ts

export const getEmployees = async () => {
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

    const employees = await response.json();

    // Ensure each employee has a shiftCount property (default to 0 if not provided)
    return employees.map((employee: any) => ({
      ...employee,
      shiftCount: employee.shiftCount ?? 0,
    }));
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};
