// \src\app\dashboard\manager\components\CreateEmployeeForm.tsx

"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export interface CreateEmployeeFormProps {
  onOptimisticAdd: (newEmployee: {
    id: string;
    name: string;
    position?: string;
    phone?: string;
  }) => void;
  onEmployeeCreated: (
    tempId: string,
    realEmployee: {
      id: string;
      name: string;
      position?: string;
      phone?: string;
    }
  ) => void;
}

export default function CreateEmployeeForm({
  onOptimisticAdd,
  onEmployeeCreated,
}: CreateEmployeeFormProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const newEmployee = {
      id: tempId,
      name,
      position,
      phone,
    };

    // Optimistically update the state
    onOptimisticAdd(newEmployee);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, position, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Employee created successfully!");
        // Call onEmployeeCreated with the tempId and the real employee returned from the API.
        onEmployeeCreated(tempId, data);
      } else {
        throw new Error(data.error || "Failed to create employee.");
      }
    } catch {
      toast.error("An error occurred. Reverting changes.");
      // Optionally, you might want to remove the optimistic employee here
      // (depending on how your parent component handles rollback).
    } finally {
      setLoading(false);
      setName("");
      setPosition("");
      setPhone("");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-bg-800 border border-border-primary shadow-md rounded-xl p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">
        Create New Employee
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Employee Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 bg-bg-700 text-text-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Position
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 bg-bg-700 text-text-primary"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Waiter, Chef, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Phone Number
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 bg-bg-700 text-text-primary"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-highlight text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
}
