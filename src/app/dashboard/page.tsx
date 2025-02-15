// src/app/dashboard/employees/page.tsx

import CreateEmployeeForm from "./components/CreateEmployeeForm";
import UserEmployees from "./components/UserEmployees";
import Sidebar from "./components/Sidebar";

export default function EmployeesPage() {
  return (
    <div className="flex h-screen bg-bg-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-bg-900 text-text-primary">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Manage Employees
        </h1>
        <CreateEmployeeForm />
        <UserEmployees />
      </main>
    </div>
  );
}
