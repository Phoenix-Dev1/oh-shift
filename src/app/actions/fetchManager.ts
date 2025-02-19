// src/actions/fetchManager.ts
export const fetchManagerName = async (
  managerId: string
): Promise<string | null> => {
  try {
    const response = await fetch(`/api/users/manager?managerId=${managerId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch manager details");
    }
    const data = await response.json();
    return data.name;
  } catch (error: any) {
    console.error("Error in fetchManagerName:", error);
    return null;
  }
};
