// src\app\dashboard\employee\page

import getCurrentUser from "../../actions/getCurrentUser";
import EmployeeData from "./components/EmployeeData";

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {user?.name || "Team Member"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
          View your upcoming shifts and summary for the month.
        </p>
      </div>
      
      <EmployeeData />
    </div>
  );
}
