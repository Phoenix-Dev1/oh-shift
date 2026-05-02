"use client";

import React, { useState } from "react";
import { useShiftBoard } from "../../hooks/useShiftBoard";
import ShiftBoardHeader from "./ShiftBoardHeader";
import ShiftBoardCalendar from "./ShiftBoardCalendar";
import ShiftBoardSkeleton from "./ShiftBoardSkeleton";
import ShiftModal from "../ShiftBoardManager/ShiftModal";
import DeleteModal from "../ShiftBoardManager/DeleteModal";
import ConfirmationModal from "../ShiftBoardManager/ConfirmationModal";
import { Shift, Employee } from "../../../types";

const ShiftBoardManager = () => {
  const { 
    shifts, 
    employees, 
    isLoading, 
    updateShift, 
    createShift, 
    deleteShift,
    viewMode,
    setViewMode,
    currentDate,
    businessDayStartHour,
    handleToday,
    handlePrevious,
    handleNext
  } = useShiftBoard();

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [pendingShift, setPendingShift] = useState<Shift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (isLoading) return <ShiftBoardSkeleton />;

  const handleEventClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedShift({
      id: "new",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      employees: [],
      allDay: false,
      title: "",
      managerId: "",
      isNew: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = (data: { 
    title?: string; 
    employees?: Employee[]; 
    allDay: boolean;
    startTime?: string;
    endTime?: string;
  }) => {
    if (!selectedShift) return;

    const finalData = {
      startTime: data.startTime || selectedShift.startTime,
      endTime: data.endTime || selectedShift.endTime,
      allDay: data.allDay !== undefined ? data.allDay : selectedShift.allDay,
      employees: data.employees || selectedShift.employees || [],
      title: data.title || selectedShift.title,
    };

    if (selectedShift.id === "new") {
      createShift({
        startTime: finalData.startTime,
        endTime: finalData.endTime,
        employees: finalData.employees.map((e: Employee) => e.id),
        allDay: finalData.allDay,
        title: finalData.title,
      });
    } else {
      updateShift({
        id: selectedShift.id,
        startTime: finalData.startTime,
        endTime: finalData.endTime,
        employees: finalData.employees.map((e: Employee) => e.id),
        allDay: finalData.allDay,
        title: finalData.title,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedShift?.id) {
      deleteShift(selectedShift.id);
    }
    setIsDeleteModalOpen(false);
    setIsModalOpen(false);
  };

  const handleConfirmUpdate = () => {
    if (pendingShift) {
      updateShift({
        ...pendingShift,
        employees: pendingShift.employees.map((e: Employee) => e.id),
      });
      setPendingShift(null);
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      <ShiftBoardHeader 
        onAddShift={() => handleDateSelect(new Date(), new Date())} 
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onToday={handleToday}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      
      <div className="grid grid-cols-1 gap-8">
        <ShiftBoardCalendar
          shifts={shifts}
          viewMode={viewMode}
          currentDate={currentDate}
          businessDayStartHour={businessDayStartHour}
          onEventClick={handleEventClick}
          onEventDrop={(updatedShift) => {
            setPendingShift(updatedShift);
            setIsConfirmModalOpen(true);
          }}
          onEventResize={(updatedShift) => {
            setPendingShift(updatedShift);
            setIsConfirmModalOpen(true);
          }}
          onDateSelect={handleDateSelect}
        />
      </div>

      {isModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={() => setIsDeleteModalOpen(true)}
          shift={selectedShift}
          employees={employees}
        />
      )}

      {isDeleteModalOpen && selectedShift && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Shift"
          message="Are you sure you want to delete this shift? This action cannot be undone."
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setPendingShift(null);
          }}
          onConfirm={handleConfirmUpdate}
          title="Confirm Shift Change"
          message="Are you sure you want to move this shift? This will update the schedule for all assigned employees."
          confirmText="Update Schedule"
        />
      )}
    </div>
  );
};

export default ShiftBoardManager;
