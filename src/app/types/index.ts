export type Role = "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  businessDayStartHour?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  managerId: string;
  employeeManagerId: string | null; // Linked User ID if any
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  title: string | null;
  managerId: string;
  employees: Employee[];
  shiftLeadId?: string | null;
  isNew?: boolean;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
}
