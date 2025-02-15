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
    return employees;
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};
