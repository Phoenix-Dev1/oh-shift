// src/actions/editEmployee.ts

export const editEmployee = async (
  id: string,
  name: string,
  position: string,
  phone: string
) => {
  try {
    const response = await fetch(`/api/employees/editEmployee`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, position, phone }),
    });
    return response.ok ? response.json() : null;
  } catch (error) {
    console.error("Failed to update employee:", error);
    return null;
  }
};
