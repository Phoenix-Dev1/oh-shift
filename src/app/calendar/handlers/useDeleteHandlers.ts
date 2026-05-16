// src/handlers/useDeleteHandlers.ts
import { toast } from "sonner";
import { Shift } from "../../types/index";

// Define an interface for the event object passed to handleEventDidMount
interface EventDidMountArg {
  event: { id: string };
  el: HTMLElement;
}

// Show Delete Modal on Right-Click
export const handleEventDidMount = (
  info: EventDidMountArg,
  setShiftToDelete: React.Dispatch<React.SetStateAction<string | null>>,
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Set a visual cue for right-click
  info.el.style.cursor = "context-menu";
  // Use an inline oncontextmenu handler
  info.el.oncontextmenu = (e: MouseEvent) => {
    e.preventDefault();
    setShiftToDelete(info.event.id);
    setIsDeleteModalOpen(true);
    return false;
  };
};

// Delete Shift from Database
export const deleteShift = async (
  shiftId: string,
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const response = await fetch(`/api/shifts/manager?id=${shiftId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Gracefully handle non-JSON responses
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete shift");
    }

    // Update State: Remove Shift from State
    setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));

    toast.success(result.message || "Shift deleted successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting shift:", error.message);
      toast.error(error.message || "Error deleting shift.");
    } else {
      console.error("Error deleting shift:", error);
      toast.error("Error deleting shift.");
    }
  } finally {
    setIsDeleteModalOpen(false);
  }
};
