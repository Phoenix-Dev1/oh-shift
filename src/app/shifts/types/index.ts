export interface Employee {
  id: string;
  name: string;
  phone?: string;
  position?: string;
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
