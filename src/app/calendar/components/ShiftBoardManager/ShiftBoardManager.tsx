"use client";

import { useState, useEffect } from "react";
import ShiftModal from "./ShiftModal";
import DeleteModal from "./DeleteModal";
import HoverModal from "./HoverModal";
import CustomFullCalendar from "./CustomFullCalendar";
import MobileFullCalendar from "./MobileFullCalendar";
import useIsMobile from "../../../hooks/useIsMobile";
import { toast } from "sonner";
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

interface LocalAssignment {
  employee?: Partial<Employee> | null;
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

      try {
        const result = selectedShift.isNew
          ? await saveShiftToDB(updatedShift)
          : await updateShiftInDB(updatedShift);

        if (result) {
          const formattedShift: Shift = {
            id: result.id,
            startTime: new Date(result.startTime).toISOString(),
            endTime: new Date(result.endTime).toISOString(),
            employees:
              result.assignments?.map((assignment: LocalAssignment) => ({
                id: assignment.employee?.id || "unknown",
                name: assignment.employee?.name || "Unnamed",
                email: assignment.employee?.email || null,
                phone: assignment.employee?.phone || null,
                position: assignment.employee?.position || "Unknown",
                managerId: assignment.employee?.managerId || "",
                employeeManagerId: assignment.employee?.employeeManagerId || null,
              })) || updatedShift.employees,
            allDay: updatedShift.allDay,
            title: result.title || updatedShift.title,
            isNew: false,
            managerId: updatedShift.managerId,
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Shift"
        message="Are you sure you want to delete this shift?"
      />

      {isShiftModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSave={handleSaveShift}
          onDelete={isMobile ? handleModalDelete : undefined}
          shift={selectedShift}
          employees={employees}
          shifts={shifts}
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
              ? hoverModalData.shift.employees.map((emp) => ({
                  name: emp.name,
                  position: emp.position ?? "N/A",
                }))
              : []
          }
          isVisible={!!hoverModalData}
        />
      )}

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
