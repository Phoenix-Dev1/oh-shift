// src/actions/editEmployee.ts

export const editEmployee = async (
  id: string,
  name: string,
  position: string
) => {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, position }),
    });
    return response.ok ? response.json() : null;
  } catch (error) {
    console.error("Failed to update employee:", error);
    return null;
  }
};
