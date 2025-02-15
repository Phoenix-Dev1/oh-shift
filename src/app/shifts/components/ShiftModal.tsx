"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../../components/Button";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startTime: string, endTime: string) => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSave = () => {
    if (!startTime || !endTime) {
      toast.warning("Please enter both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be before end time.");
      return;
    }

    onSave(startTime, endTime);
    toast.success("Shift added successfully!");

    // Reset fields and close modal
    setStartTime("");
    setEndTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-backdrop flex justify-center items-center z-50">
      <div className="bg-bg-800 text-text-primary dark:bg-bg-700 dark:text-text-secondary p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-center">Add Shift</h2>
        <div className="space-y-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded border bg-bg-900 dark:bg-bg-800 text-text-primary dark:text-text-secondary"
            placeholder="Start Time"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 rounded border bg-bg-900 dark:bg-bg-800 text-text-primary dark:text-text-secondary"
            placeholder="End Time"
          />
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Add Shift</Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
