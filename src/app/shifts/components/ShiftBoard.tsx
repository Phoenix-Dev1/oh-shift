"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ShiftModal from "./ShiftModal";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Employee {
  id: string;
  name: string;
  phone?: string;
  position?: string;
}

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  employees: Employee[];
}

const ShiftBoard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        if (response.ok) {
          setEmployees(data);
        } else {
          toast.error(data.error || "Failed to load employees.");
        }
      } catch (error) {
        toast.error("Error fetching employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchShiftsFromDB();
  }, []);

  // Add or Update Shift
  const handleSaveShift = async (shiftData: { employees: Employee[] }) => {
    if (selectedShift) {
      const updatedShift = {
        ...selectedShift,
        employees: shiftData.employees,
      };

      // Save Shift to DB
      const dbShift = await saveShiftToDB(updatedShift);

      // Update State Locally
      if (dbShift) {
        setShifts(
          shifts.map((shift) =>
            shift.id === updatedShift.id ? updatedShift : shift
          )
        );
        toast.success("Shift updated successfully.");
      }

      setIsShiftModalOpen(false);
    }
  };

  // Create Shift on Calendar Selection
  const handleDateSelect = (selectInfo: any) => {
    const newShift: Shift = {
      id: crypto.randomUUID(),
      startTime: selectInfo.startStr,
      endTime: selectInfo.endStr,
      employees: [],
    };
    setShifts([...shifts, newShift]);
    toast.success("Shift created. Click to assign employees.");
  };

  // Open Shift Modal on Shift Click
  const handleEventClick = (clickInfo: any) => {
    const shift = shifts.find((s) => s.id === clickInfo.event.id);
    if (shift) {
      setSelectedShift(shift);
      setIsShiftModalOpen(true);
    }
  };

  // Shift Movement (Drag-and-Drop)
  const handleEventDrop = (dropInfo: any) => {
    const { event } = dropInfo;
    setShifts(
      shifts.map((shift) =>
        shift.id === event.id
          ? {
              ...shift,
              startTime: event.start?.toISOString() || shift.startTime,
              endTime: event.end?.toISOString() || shift.endTime,
            }
          : shift
      )
    );
    toast.info("Shift moved successfully.");
  };

  // Shift Resizing
  const handleEventResize = (resizeInfo: any) => {
    const { event } = resizeInfo;
    setShifts(
      shifts.map((shift) =>
        shift.id === event.id
          ? {
              ...shift,
              endTime: event.end?.toISOString() || shift.endTime,
            }
          : shift
      )
    );
    toast.info("Shift resized successfully.");
  };

  // Open Delete Modal on Right-Click
  const handleEventDidMount = (info: any) => {
    const eventElement = info.el;
    eventElement.addEventListener("contextmenu", (e: any) => {
      e.preventDefault();
      setShiftToDelete(info.event.id);
      setIsDeleteModalOpen(true);
    });
  };

  // Handle Shift Deletion
  const handleDeleteShift = () => {
    if (shiftToDelete) {
      setShifts(shifts.filter((shift) => shift.id !== shiftToDelete));
      toast.success("Shift deleted successfully.");
      setShiftToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // ======= Improved Display Logic =======

  // Format Shifts for FullCalendar with clearer employee display
  // Generate events for FullCalendar
  const calendarEvents = shifts.map((shift) => {
    const employeeNames = Array.isArray(shift.employees)
      ? shift.employees.map((e) => e.name).join(", ")
      : "No Employees Assigned";

    return {
      id: shift.id,
      title: employeeNames || "No Employees Assigned",
      start: shift.startTime,
      end: shift.endTime,
      backgroundColor:
        Array.isArray(shift.employees) && shift.employees.length > 0
          ? "#4CAF50"
          : "#f39c12",
      extendedProps: {
        employees: shift.employees, // Pass employees to extendedProps
      },
    };
  });

  // Tooltip for employee details on hover
  const handleEventContent = (eventInfo: any) => {
    const employees = Array.isArray(eventInfo.event.extendedProps?.employees)
      ? eventInfo.event.extendedProps.employees
      : [];

    if (employees.length === 0) {
      return (
        <div className="p-1">
          <div className="font-bold text-sm">No Employees Assigned</div>
        </div>
      );
    }

    // Full employee list (for tooltip)
    const employeeList = employees
      .map(
        (e: Employee) => `- ${e.name} ${e.position ? `(${e.position})` : ""}`
      )
      .join("\n");

    // Render event block with hover tooltip
    return (
      <div className="p-1">
        <div className="font-bold text-sm">{eventInfo.event.title}</div>
        <div
          className="text-xs text-gray-500"
          title={`Assigned Employees:\n${employeeList}`}
        >
          {employees.length > 3 ? `... and ${employees.length - 3} more` : ""}
        </div>
      </div>
    );
  };

  // Function to Save Shift to Database
  const saveShiftToDB = async (shift: Shift) => {
    try {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: shift.startTime,
          endTime: shift.endTime,
          employees: shift.employees.map((emp) => emp.id),
        }),
      });

      // Check if response is empty before parsing
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save shift: ${errorText}`);
      }

      const result = await response.json();
      console.log("Shift saved:", result);
      toast.success("Shift saved to database!");
      return result;
    } catch (error: any) {
      console.error("Error saving shift:", error.message);
      toast.error("Error saving shift to database.");
    }
  };

  // Fetch Shifts from Database
  const fetchShiftsFromDB = async () => {
    try {
      const response = await fetch("/api/shifts");
      if (!response.ok) {
        throw new Error("Failed to load shifts from database");
      }

      const shiftsFromDB = await response.json();
      // console.log("Fetched Shifts from DB:", shiftsFromDB);

      // Convert DB shifts to internal Shift type
      const dbShifts: Shift[] = shiftsFromDB.map((shift: any) => ({
        id: shift.id,
        startTime: shift.startTime,
        endTime: shift.endTime,
        employees: Array.isArray(shift.assignments)
          ? shift.assignments.map((assignment: any) => ({
              id: assignment.employee?.id ?? "unknown",
              name: assignment.employee?.name ?? "Unnamed",
              position: assignment.employee?.position ?? "Unknown",
            }))
          : [],
      }));

      setShifts(dbShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Failed to load shifts.");
    }
  };

  return (
    <div className="p-4">
      {/* Shift Deletion Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteShift}
        title="Delete Shift"
        message="Are you sure you want to delete this shift?"
      />

      {/* Shift Assignment Modal */}
      {isShiftModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSave={handleSaveShift}
          shift={selectedShift}
          employees={employees}
        />
      )}

      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={calendarEvents}
        eventContent={handleEventContent} // Use custom content renderer
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventDidMount={handleEventDidMount}
        height="85vh"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        headerToolbar={{
          left: "today",
          center: "prev,next",
          right: "title",
        }}
        eventOverlap={false}
      />

      {/* Employee Loading State */}
      {loadingEmployees && (
        <p className="text-center mt-4">Loading employees...</p>
      )}
    </div>
  );
};

export default ShiftBoard;
