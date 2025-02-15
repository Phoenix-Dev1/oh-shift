// app/shifts/components/ShiftModal.tsx
"use client";

import { useState } from "react";
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
      alert("Please enter both start and end times.");
      return;
    }
    onSave(startTime, endTime);
    setStartTime("");
    setEndTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-center">Add Shift</h2>
        <div className="space-y-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700"
            placeholder="Start Time"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700"
            placeholder="End Time"
          />
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={onClose} secondary>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Shift</Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
