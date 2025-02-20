export const deleteAssignedShifts = async (id: string) => {
  try {
    const response = await fetch(`/api/employees/deleteAssignedShifts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }), // Employee ID sent in the request body
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete assigned shifts:", error);
    return false;
  }
};
