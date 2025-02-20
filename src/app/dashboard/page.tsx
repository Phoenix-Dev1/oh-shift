// src\app\dashboard\page.tsx

import { redirect } from "next/navigation";
import getCurrentUser from "../actions/getCurrentUser";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login"); // If no user, send to login
  }

  // Redirect based on user role
  if (user.role === "EMPLOYEE") {
    redirect("/dashboard/employee");
  } else if (user.role === "MANAGER") {
    redirect("/dashboard/manager");
  } else {
    redirect("/login"); // Fallback if no valid role
  }

  return null; // Just a fallback
}
