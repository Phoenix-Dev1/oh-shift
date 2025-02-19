"use client";

import { useState, useEffect } from "react";
import ShiftModal from "./ShiftModal";
import DeleteModal from "./DeleteModal";
import HoverModal from "./HoverModal";
import CustomFullCalendar from "./CustomFullCalendar";
import MobileFullCalendar from "./MobileFullCalendar";
import useIsMobile from "../../../hooks/useIsMobile";
import { toast } from "react-toastify";
import { Employee, Shift } from "../../../types/index";
import { deleteShift } from "../../handlers/useDeleteHandlers";
import { fetchEmployees } from "../../handlers/useEmployeeHandlers";
import {
  fetchShiftsFromDB,
  updateShiftInDB,
  saveShiftToDB,
} from "../../handlers/useDatabaseHandlers";

// Define types to avoid explicit any
interface ShiftDataInput {
  title?: string;
  employees?: Employee[];
  startTime?: string | Date;
  endTime?: string | Date;
}

interface AssignmentResponse {
  employee?: Employee | null;
}

interface ShiftResponse {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  assignments?: AssignmentResponse[];
  title?: string;
}

const ShiftBoardManager: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  // Hover Modal State
  const [hoverModalData, setHoverModalData] = useState<{
    x: number;
    y: number;
    shift: Shift;
  } | null>(null);

  // Mobile detection hook
  const isMobile = useIsMobile();

  const handleModalDelete = async () => {
    if (selectedShift) {
      // Call the delete function for the selected shift
      await deleteShift(selectedShift.id, setShifts, setIsDeleteModalOpen);
      setSelectedShift(null);
      setIsShiftModalOpen(false);
    }
  };

  useEffect(() => {
    fetchEmployees(setEmployees, setLoadingEmployees);
    fetchShiftsFromDB(setShifts);
  }, []);

  const handleDeleteConfirm = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete, setShifts, setIsDeleteModalOpen);
      setShiftToDelete(null);
    }
  };

  const handleSaveShift = async (shiftData: ShiftDataInput) => {
    if (selectedShift) {
      let updatedShift: Shift;
      if (selectedShift.allDay) {
        updatedShift = { ...selectedShift, title: shiftData.title || "" };
      } else {
        updatedShift = {
          ...selectedShift,
          employees: shiftData.employees || [],
        };
      }
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === updatedShift.id ? updatedShift : shift
        )
      );
      let result: ShiftResponse;
      try {
        if (selectedShift.isNew) {
          result = await saveShiftToDB(updatedShift);
        } else {
          result = await updateShiftInDB(updatedShift);
        }
        if (result) {
          const formattedShift: Shift = {
            id: result.id,
            // Convert to ISO string to satisfy the expected type
            startTime: new Date(result.startTime).toISOString(),
            endTime: new Date(result.endTime).toISOString(),
            employees:
              result.assignments?.map((assignment: AssignmentResponse) => ({
                id: assignment.employee?.id || "unknown",
                name: assignment.employee?.name || "Unnamed",
                position: assignment.employee?.position || "Unknown",
                // Provide a fallback for employeeManagerId as required by the Employee type
                employeeManagerId: assignment.employee?.employeeManagerId || "",
              })) || updatedShift.employees,
            allDay: updatedShift.allDay,
            title: result.title || updatedShift.title,
            isNew: false,
          };
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
      } finally {
        setIsShiftModalOpen(false);
      }
    }
  };

  const mapShiftsToEvents = (shifts: Shift[]) => {
    return shifts.map((shift) => {
      if (shift.allDay) {
        return {
          id: shift.id,
          title: shift.title || "All Day Shift",
          start: shift.startTime,
          end: shift.endTime,
          allDay: true,
        };
      } else {
        return {
          id: shift.id,
          title:
            (shift.employees || []).map((e) => e.name).join(", ") ||
            "No Employees",
          start: shift.startTime,
          end: shift.endTime,
          allDay: false,
        };
      }
    });
  };

  return (
    <div className="p-4">
      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Shift"
        message="Are you sure you want to delete this shift?"
      />

      {/* Shift Modal */}
      {isShiftModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSave={handleSaveShift}
          // Pass the onDelete callback if on mobile
          onDelete={isMobile ? handleModalDelete : undefined}
          shift={selectedShift}
          employees={employees}
        />
      )}

      {!isMobile && (
        <HoverModal
          x={hoverModalData?.x ?? 0}
          y={hoverModalData?.y ?? 0}
          startTime={
            hoverModalData
              ? hoverModalData.shift.allDay
                ? hoverModalData.shift.title || ""
                : new Date(hoverModalData.shift.startTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
              : ""
          }
          endTime={
            hoverModalData && !hoverModalData.shift.allDay
              ? new Date(hoverModalData.shift.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          }
          employees={
            hoverModalData && !hoverModalData.shift.allDay
              ? hoverModalData.shift.employees.map((emp) => emp.name)
              : []
          }
          isVisible={!!hoverModalData}
        />
      )}

      {/* Render either the mobile or desktop calendar */}
      {isMobile ? (
        <MobileFullCalendar
          shifts={shifts}
          setShifts={setShifts}
          setSelectedShift={setSelectedShift}
          setIsShiftModalOpen={setIsShiftModalOpen}
          setShiftToDelete={setShiftToDelete}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setHoverModalData={setHoverModalData}
          mapShiftsToEvents={mapShiftsToEvents}
        />
      ) : (
        <CustomFullCalendar
          shifts={shifts}
          setShifts={setShifts}
          setSelectedShift={setSelectedShift}
          setIsShiftModalOpen={setIsShiftModalOpen}
          setShiftToDelete={setShiftToDelete}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setHoverModalData={setHoverModalData}
          mapShiftsToEvents={mapShiftsToEvents}
        />
      )}

      {loadingEmployees && (
        <p className="text-center mt-4">Loading employees...</p>
      )}
    </div>
  );
};

export default ShiftBoardManager;
