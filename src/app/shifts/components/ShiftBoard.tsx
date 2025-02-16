// src/components/ShiftBoard.tsx
"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ShiftModal from "./ShiftModal";
import DeleteModal from "./DeleteModal";

import {
  handleEventDidMount,
  deleteShift,
} from "../handlers/useDeleteHandlers";

import {
  handleDateSelect,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
} from "../handlers/useShiftHandlers";

import { fetchEmployees } from "../handlers/useEmployeeHandlers";
import {
  fetchShiftsFromDB,
  saveShiftToDB,
} from "../handlers/useDatabaseHandlers";

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

  // Delete Shift Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  // Fetch Shifts and Employees on Mount
  useEffect(() => {
    fetchEmployees(setEmployees, setLoadingEmployees);
    fetchShiftsFromDB(setShifts);
  }, []);

  // Handle Confirm Shift Deletion
  const handleDeleteConfirm = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete, setShifts, setIsDeleteModalOpen);
      setShiftToDelete(null);
    }
  };

  return (
    <div className="p-4">
      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm} // ✅ Call deleteShift on confirm
        title="Delete Shift"
        message="Are you sure you want to delete this shift?"
      />

      {/* Shift Modal */}
      {isShiftModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSave={() => {}}
          shift={selectedShift}
          employees={employees}
        />
      )}

      {/* FullCalendar */}
      <FullCalendar
        direction="rtl"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={shifts.map((shift) => ({
          id: shift.id,
          title:
            shift.employees.map((e) => e.name).join(", ") || "No Employees",
          start: shift.startTime,
          end: shift.endTime,
        }))}
        select={(info) => handleDateSelect(info, shifts, setShifts)}
        eventClick={(info) =>
          handleEventClick(info, shifts, setSelectedShift, setIsShiftModalOpen)
        }
        eventDrop={(info) => handleEventDrop(info, shifts, setShifts)}
        eventResize={(info) => handleEventResize(info, shifts, setShifts)}
        eventDidMount={(info) =>
          handleEventDidMount(info, setShiftToDelete, setIsDeleteModalOpen)
        } // ✅ Show Delete Modal on Right-Click
        height="85vh"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
      />

      {/* Loading State */}
      {loadingEmployees && (
        <p className="text-center mt-4">Loading employees...</p>
      )}
    </div>
  );
};

export default ShiftBoard;
