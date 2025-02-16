// src/handlers/useDeleteHandlers.ts
import { toast } from "react-toastify";

// Show Delete Modal on Right-Click
export const handleEventDidMount = (
  info: any,
  setShiftToDelete: React.Dispatch<React.SetStateAction<string | null>>,
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const eventElement = info.el;
  eventElement.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault(); // Prevent browser context menu
    setShiftToDelete(info.event.id);
    setIsDeleteModalOpen(true);
  });
};

// Delete Shift from Database
export const deleteShift = async (
  shiftId: string,
  setShifts: React.Dispatch<React.SetStateAction<any[]>>,
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const response = await fetch(`/api/shifts?id=${shiftId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ✅ Gracefully handle non-JSON responses
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete shift");
    }

    // ✅ Update State: Remove Shift from State
    setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));

    toast.success(result.message || "Shift deleted successfully.");
  } catch (error: any) {
    console.error("Error deleting shift:", error);
    toast.error(error.message || "Error deleting shift.");
  } finally {
    setIsDeleteModalOpen(false);
  }
};
