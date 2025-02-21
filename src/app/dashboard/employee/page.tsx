// src\app\dashboard\employee\page

import Sidebar from "./components/Sidebar";
import getCurrentUser from "../../actions/getCurrentUser";
import EmployeeData from "./components/EmployeeData";

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-bg-full">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-bg-800 text-text-primary">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {user?.name} Shifts
        </h1>
        <EmployeeData />
      </main>
    </div>
  );
}
