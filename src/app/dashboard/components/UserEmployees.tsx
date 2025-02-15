// src/app/dashboard/employees/page.tsx

"use client";

import { useEffect, useState } from "react";
import { getEmployees } from "../../actions/getEmployees";

type Employee = {
  id: string;
  name: string;
  position?: string;
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    async function fetchEmployees() {
      const data = await getEmployees();
      setEmployees(data);
    }
    fetchEmployees();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-text-secondary">
        My Employees
      </h1>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Position</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 dark:text-text-secondary">
                  {employee.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 dark:text-text-secondary">
                  {employee.position || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 dark:text-text-secondary">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
