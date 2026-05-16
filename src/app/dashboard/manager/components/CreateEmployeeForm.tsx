"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserCircle, Briefcase, Phone } from "lucide-react";

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

    const tempId = `temp-${Date.now()}`;
    const newEmployee = { id: tempId, name, position, phone };

    onOptimisticAdd(newEmployee);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Employee onboarded successfully");
        onEmployeeCreated(tempId, data);
      } else {
        throw new Error(data.error || "Failed to create employee.");
      }
    } catch {
      toast.error("Failed to sync with server. Reverting...");
    } finally {
      setLoading(false);
      setName("");
      setPosition("");
      setPhone("");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add Team Member
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create a new profile to begin shift assignments.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
            Full Name
          </label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rodriguez"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
            Role / Position
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Senior Barista"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="md:col-span-3 flex justify-end mt-2 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Onboarding..." : "Confirm Onboarding"}
          </button>
        </div>
      </form>
    </div>
  );
}
