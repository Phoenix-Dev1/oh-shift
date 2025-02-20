// src/actions/unassignEmployeeUser.ts

export const unassignEmployeeUser = async (
  employeeId: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/manager/unassignEmployeeUser", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to unassign employee user:", error);
    return false;
  }
};
