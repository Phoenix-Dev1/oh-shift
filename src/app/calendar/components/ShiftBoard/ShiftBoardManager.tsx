"use client";

import React, { useState } from "react";
import { useShiftBoard } from "../../hooks/useShiftBoard";
import ShiftBoardHeader from "./ShiftBoardHeader";
import ShiftBoardCalendar from "./ShiftBoardCalendar";
import ShiftBoardSkeleton from "./ShiftBoardSkeleton";
import ShiftModal from "../ShiftBoardManager/ShiftModal"; // Keeping legacy modal for now
import DeleteModal from "../ShiftBoardManager/DeleteModal"; // Keeping legacy modal for now
import { Shift } from "../../../types";

const ShiftBoardManager = () => {
  const { 
    shifts, 
    employees, 
    isLoading, 
    updateShift, 
    createShift, 
    deleteShift 
  } = useShiftBoard();

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      managerId: "", // Will be set by server
    } as any);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (selectedShift?.id === "new") {
      createShift({
        startTime: data.startTime,
        endTime: data.endTime,
        employees: data.employees.map((e: any) => e.id),
        allDay: data.allDay,
        title: data.title,
      });
    } else if (selectedShift) {
      updateShift({
        id: selectedShift.id,
        startTime: data.startTime,
        endTime: data.endTime,
        employees: data.employees.map((e: any) => e.id),
        allDay: data.allDay,
        title: data.title,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      <ShiftBoardHeader onAddShift={() => handleDateSelect(new Date(), new Date())} />
      
      <div className="grid grid-cols-1 gap-8">
        <ShiftBoardCalendar
          shifts={shifts}
          onEventClick={handleEventClick}
          onEventDrop={(updatedShift) => updateShift(updatedShift)}
          onEventResize={(updatedShift) => updateShift(updatedShift)}
          onDateSelect={handleDateSelect}
        />
      </div>

      {isModalOpen && selectedShift && (
        <ShiftModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          shift={selectedShift}
          employees={employees}
        />
      )}

      {isDeleteModalOpen && selectedShift && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            deleteShift(selectedShift.id);
            setIsDeleteModalOpen(false);
          }}
          title="Delete Shift"
          message="Are you sure you want to delete this shift?"
        />
      )}
    </div>
  );
};

export default ShiftBoardManager;
