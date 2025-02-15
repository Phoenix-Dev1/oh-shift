// src/components/CreateEmployeeForm.tsx

"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateEmployeeForm() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, position }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Employee created successfully!");
        setName("");
        setPosition("");
      } else {
        toast.error(data.error || "Failed to create employee.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4">Create New Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Employee Name</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Position</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Waiter, Chef, etc."
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
}
