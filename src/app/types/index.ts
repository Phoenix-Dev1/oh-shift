export interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  position?: string;
  employeeManagerId: string | null;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  employees: Employee[];
  allDay?: boolean;
  title?: string;
  isNew?: boolean;
}
