export const deleteEmployee = async (id: string) => {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    });
    return response.ok ? true : false;
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return false;
  }
};
