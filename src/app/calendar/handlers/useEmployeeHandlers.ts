// src/handlers/useEmployeeHandlers.ts
import { toast } from "react-toastify";
import { Employee } from "../../types";

export const fetchEmployees = async (
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>,
  setLoadingEmployees: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const response = await fetch("/api/employees");
    const data = await response.json();
    if (response.ok) {
      setEmployees(data);
    } else {
      toast.error(data.error || "Failed to load employees.");
    }
  } catch {
    toast.error("Error fetching employees.");
  } finally {
    setLoadingEmployees(false);
  }
};
