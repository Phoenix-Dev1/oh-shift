export const fetchManagerName = async (
  managerId: string
): Promise<string | null> => {
  try {
    const response = await fetch(`/api/users/manager?managerId=${managerId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch manager details");
    }
    const data: { name: string } = await response.json();
    return data.name;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in fetchManagerName:", error.message);
    } else {
      console.error("An unknown error occurred in fetchManagerName.");
    }
    return null;
  }
};
