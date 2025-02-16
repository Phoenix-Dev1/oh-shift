// src/components/ShiftBoard.tsx
"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ShiftModal from "./ShiftModal";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import { Employee, Shift } from "../types/index";
import {
  handleDateSelect,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
} from "../handlers/useShiftHandlers";
import {
  handleEventDidMount,
  deleteShift,
} from "../handlers/useDeleteHandlers";
import { fetchEmployees } from "../handlers/useEmployeeHandlers";
import {
  fetchShiftsFromDB,
  updateShiftInDB,
  saveShiftToDB,
} from "../handlers/useDatabaseHandlers";

const ShiftBoard: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Delete Shift Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchEmployees(setEmployees, setLoadingEmployees);
    fetchShiftsFromDB(setShifts);
  }, []);

  // Delete a shift
  const handleDeleteConfirm = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete, setShifts, setIsDeleteModalOpen);
      setShiftToDelete(null);
    }
  };

  // Save (update) a shift
  const handleSaveShift = async (shiftData: { employees: Employee[] }) => {
    if (selectedShift) {
      // Prepare the updated shift with the new employees
      const updatedShift: Shift = {
        ...selectedShift,
        employees: shiftData.employees,
      };

      // Optimistically update the local state immediately
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === updatedShift.id ? updatedShift : shift
        )
      );

      // Save the shift (POST if new, PUT if existing)
      let result: any;
      try {
        if (selectedShift.isNew) {
          result = await saveShiftToDB(updatedShift);
        } else {
          result = await updateShiftInDB(updatedShift);
        }

        if (result) {
          // Transform the response if it includes assignments rather than a direct employees array.
          const formattedShift: Shift = {
            id: result.id,
            startTime: result.startTime,
            endTime: result.endTime,
            employees:
              result.assignments?.map((assignment: any) => ({
                id: assignment.employee?.id || "unknown",
                name: assignment.employee?.name || "Unnamed",
                position: assignment.employee?.position || "Unknown",
              })) || updatedShift.employees,
          };

          // Update state with the formatted response data
          setShifts((prevShifts) =>
            prevShifts.map((shift) =>
              shift.id === formattedShift.id ? formattedShift : shift
            )
          );

          toast.success(
            selectedShift.isNew
              ? "Shift created successfully."
              : "Shift updated successfully."
          );
        }
      } catch (error) {
        console.error("API error:", error);
        toast.error("There was an error saving the shift.");

        // Optionally, roll back the optimistic update by re-fetching shifts or restoring previous state.
        // For example:
        // fetchShiftsFromDB(setShifts);
      } finally {
        setIsShiftModalOpen(false);
      }
    }
  };

  return (
    <div className="p-4">
      {/* Shift Deletion Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
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
        direction="rtl"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={shifts.map((shift) => ({
          id: shift.id,
          title:
            (shift.employees || []).map((e) => e.name).join(", ") ||
            "No Employees",
          start: shift.startTime,
          end: shift.endTime,
        }))}
        select={(selectInfo) => handleDateSelect(selectInfo, shifts, setShifts)}
        eventClick={(clickInfo) =>
          handleEventClick(
            clickInfo,
            shifts,
            setSelectedShift,
            setIsShiftModalOpen
          )
        }
        eventDrop={(dropInfo) => handleEventDrop(dropInfo, shifts, setShifts)}
        eventResize={(resizeInfo) =>
          handleEventResize(resizeInfo, shifts, setShifts)
        }
        eventDidMount={(info) =>
          handleEventDidMount(info, setShiftToDelete, setIsDeleteModalOpen)
        }
        height="85vh"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
      />

      {/* Employee Loading State */}
      {loadingEmployees && (
        <p className="text-center mt-4">Loading employees...</p>
      )}
    </div>
  );
};

export default ShiftBoard;
