// src\app\actions\getManagerUsers.ts

export interface ManagerUser {
  id: string;
  email: string;
  name?: string;
}

export const getManagerUsers = async (): Promise<ManagerUser[]> => {
  try {
    const response = await fetch("/api/manager/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const users: ManagerUser[] = await response.json();
    return users;
  } catch (error) {
    console.error("Failed to fetch manager users:", error);
    return [];
  }
};
