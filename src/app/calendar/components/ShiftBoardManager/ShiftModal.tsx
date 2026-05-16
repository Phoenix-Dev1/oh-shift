"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Save, Trash2, Clock, Check, ChevronRight, History, Loader2, AlertCircle, Search, Star, Crown, XCircle, UserRoundMinus } from "lucide-react";
import { useMemo } from "react";
import { Shift, Employee } from "../../../types";
import useIsMobile from "../../../hooks/useIsMobile";
import { format, parseISO, setHours, setMinutes, startOfDay, addDays, isSameDay } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecentShiftTitles, saveRecentShiftTitle, removeRecentShiftTitle } from "../../../actions/shiftMemoryActions";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    title?: string; 
    employees?: Employee[]; 
    allDay: boolean;
    startTime?: string;
    endTime?: string;
    shiftLeadId?: string | null;
  }) => void;
  onDelete?: () => void;
  shift?: Shift | null;
  employees: Employee[];
  shifts: Shift[];
  isReadOnly?: boolean;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  employees,
  shift,
  shifts,
  isReadOnly = false,
}) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [localTitle, setLocalTitle] = useState<string>("");
  const [allDay, setAllDay] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [shiftLeadId, setShiftLeadId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Confirmation state for title deletion
  const [titleToDelete, setTitleToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Phase 3: TanStack Query Integration
  const { data: recentTitles = [], isLoading: isLoadingTitles } = useQuery({
    queryKey: ["recentShiftTitles"],
    queryFn: () => getRecentShiftTitles(),
    enabled: isOpen && !isReadOnly,
  });

  const saveTitleMutation = useMutation({
    mutationFn: saveRecentShiftTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentShiftTitles"] });
    }
  });

  const removeTitleMutation = useMutation({
    mutationFn: removeRecentShiftTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentShiftTitles"] });
      setTitleToDelete(null);
    }
  });

  // Phase 1: Population Logic
  useEffect(() => {
    if (shift) {
      setLocalTitle(shift.title || "");
      setAllDay(shift.allDay || false);
      
      const start = parseISO(shift.startTime);
      const end = parseISO(shift.endTime);
      
      setSelectedDate(format(start, "yyyy-MM-dd"));
      setStartTime(format(start, "HH:mm"));
      setEndTime(format(end, "HH:mm"));
      
      setSelectedEmployeeIds(shift.employees?.map((emp) => emp.id) || []);
      setShiftLeadId(shift.shiftLeadId || null);
    }
  }, [shift]);

  useEffect(() => {
    if (shiftLeadId && !selectedEmployeeIds.includes(shiftLeadId)) {
      setShiftLeadId(null);
    }
  }, [selectedEmployeeIds, shiftLeadId]);

  // Phase 1: Optimized Filtering Engine
  const filteredAndSortedEmployees = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    
    // 1. Filter by Search Query
    const filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(searchLower) || 
      (emp.position?.toLowerCase() || "").includes(searchLower)
    );

    // 2. Apply "Lead-First" and "Selected-First" Sorting
    return filtered.sort((a, b) => {
      // Shift Lead First
      if (a.id === shiftLeadId) return -1;
      if (b.id === shiftLeadId) return 1;
      
      // Selected Employees Next
      const aSelected = selectedEmployeeIds.includes(a.id);
      const bSelected = selectedEmployeeIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Alphabetical for tie-break
      return a.name.localeCompare(b.name);
    });
  }, [employees, searchQuery, selectedEmployeeIds, shiftLeadId]);

  const handleSave = () => {
    if (isReadOnly) return;
    const trimmedTitle = localTitle.trim();
    
    // Phase 3: Submit Logic - Execute Database Mutation
    if (trimmedTitle) {
      saveTitleMutation.mutate(trimmedTitle);
    }

    const selectedEmployees = employees.filter((emp) =>
      selectedEmployeeIds.includes(emp.id)
    );

    const baseDate = parseISO(selectedDate);
    let finalStartTime: string;
    let finalEndTime: string;

    if (allDay) {
      finalStartTime = startOfDay(baseDate).toISOString();
      finalEndTime = startOfDay(baseDate).toISOString();
    } else {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      
      const startDate = setMinutes(setHours(baseDate, startH), startM);
      let endDate = setMinutes(setHours(baseDate, endH), endM);
      
      // Smart Date Math: If end time is before start time, it spans across midnight
      if (endDate < startDate) {
        endDate = addDays(endDate, 1);
      }
      
      finalStartTime = startDate.toISOString();
      finalEndTime = endDate.toISOString();
    }

    onSave({ 
      title: trimmedTitle, 
      employees: selectedEmployees,
      allDay: allDay,
      startTime: finalStartTime,
      endTime: finalEndTime,
      shiftLeadId: shiftLeadId
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isMobile ? "w-full max-w-md h-[90vh]" : "w-full max-w-4xl max-h-[90vh]"
            }`}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {allDay ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {isReadOnly ? "Shift Details" : shift?.id === "new" ? "Create New Shift" : "Edit Shift Configuration"}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                    {allDay ? "Global Scheduling" : "Timed Assignment"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Title Input with Combobox */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Shift Title / Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly={isReadOnly}
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      onFocus={() => !isReadOnly && setIsDropdownOpen(true)}
                      onBlur={(e) => {
                        // Only close if the new focus target is outside the dropdown container
                        if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
                          setIsDropdownOpen(false);
                          setTitleToDelete(null);
                        }
                      }}
                      placeholder={isReadOnly ? "" : "e.g. Lead Server, Bar Manager..."}
                      className={`w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-all font-medium ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-indigo-500/20"}`}
                    />
                    
                    {/* Phase 3: Autocomplete Dropdown with DB Fetching */}
                    <AnimatePresence>
                      {!isReadOnly && isDropdownOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                        >
                          <li className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-1.5">
                            <History className="w-3 h-3" />
                            Recent Titles
                          </li>
                          
                          {isLoadingTitles ? (
                            <li className="px-3 py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                              Synchronizing history...
                            </li>
                          ) : recentTitles && (recentTitles as string[]).length > 0 ? (
                            (recentTitles as string[]).map((title, idx) => (
                              <li
                                key={idx}
                                className="group px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                                onClick={() => {
                                  if (!titleToDelete) {
                                    setLocalTitle(title);
                                    setIsDropdownOpen(false);
                                  }
                                }}
                              >
                                <AnimatePresence mode="wait">
                                  {titleToDelete === title ? (
                                    <motion.div 
                                      key="confirm"
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-center gap-2 text-red-500 font-bold text-xs"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      Remove?
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeTitleMutation.mutate(title);
                                        }}
                                        className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-red-600 transition-colors"
                                      >
                                        Yes
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTitleToDelete(null);
                                        }}
                                        className="text-slate-400 hover:text-slate-600 px-2 py-0.5 text-[10px]"
                                      >
                                        No
                                      </button>
                                    </motion.div>
                                  ) : (
                                    <motion.span key="title" className="truncate">{title}</motion.span>
                                  )}
                                </AnimatePresence>

                                <div className="flex items-center gap-2">
                                  {titleToDelete !== title && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTitleToDelete(title);
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-4 text-[10px] text-slate-400 text-center italic">
                              No recent titles found
                            </li>
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Duration Type
                  </label>
                  <div className={`flex bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 ${isReadOnly ? "opacity-70 pointer-events-none" : ""}`}>
                    <button
                      onClick={() => !isReadOnly && setAllDay(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        !allDay 
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Timed
                    </button>
                    <button
                      onClick={() => !isReadOnly && setAllDay(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        allDay 
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      All Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                    <span>Scheduled Date</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {selectedDate ? format(parseISO(selectedDate), "EEEE") : ""}
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      readOnly={isReadOnly}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white transition-all font-medium ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-indigo-500/20"}`}
                    />
                  </div>
                </div>

                <div className={`space-y-2 transition-all duration-300 ${allDay ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      readOnly={isReadOnly}
                      value={startTime}
                      disabled={allDay || isReadOnly}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white transition-all font-medium ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-indigo-500/20"}`}
                    />
                  </div>
                </div>

                <div className={`space-y-2 transition-all duration-300 ${allDay ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    End Time
                  </label>
                  <div className="relative">
                    <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      readOnly={isReadOnly}
                      value={endTime}
                      disabled={allDay || isReadOnly}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-900 dark:text-white transition-all font-medium ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-indigo-500/20"}`}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Team Assignment</h3>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                    {selectedEmployeeIds.length} Assigned
                  </span>
                </div>

                {/* Phase 2: Search Input Implementation */}
                {!isReadOnly && (
                  <div className="relative sticky top-0 z-20 bg-white dark:bg-slate-900 pb-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search team members by name or role..."
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                    {searchQuery.length > 0 && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                )}
                
                <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4 max-h-[400px] overflow-y-auto pr-2`}>
                  {filteredAndSortedEmployees.length > 0 ? (
                    filteredAndSortedEmployees.map((emp) => {
                      const isSelected = selectedEmployeeIds.includes(emp.id);
                      const isLead = shiftLeadId === emp.id;
                      
                      // Phase 4: Conflict Prevention
                      const conflictShift = shifts.find(s => 
                        s.id !== shift?.id && 
                        s.employees.some(e => e.id === emp.id) &&
                        isSameDay(parseISO(s.startTime), parseISO(selectedDate))
                      );

                      return (
                        <motion.div
                          key={emp.id}
                          onClick={() =>
                            !isReadOnly && setSelectedEmployeeIds((prev) =>
                              prev.includes(emp.id)
                                ? prev.filter((e) => e !== emp.id)
                                : [...prev, emp.id]
                            )
                          }
                          className={`group p-4 rounded-xl border transition-all relative ${
                            isReadOnly ? "cursor-default" : "cursor-pointer"
                          } ${
                            isLead
                              ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20"
                              : isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                              : conflictShift 
                              ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {/* Phase 2: Shift Lead Badge */}
                          {isLead && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
                              <Crown className="w-2.5 h-2.5" />
                              Shift Lead
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected || isLead ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}>
                                {emp.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <p className={`text-sm font-bold truncate ${isSelected || isLead ? "text-white" : "text-slate-900 dark:text-white"}`}>
                                  {emp.name}
                                </p>
                                <div className="flex flex-col mt-0.5 gap-0.5">
                                  <p className={`text-[10px] font-medium truncate ${isSelected || isLead ? "text-white/70" : "text-slate-500"}`}>
                                    {emp.position || "Staff"}
                                  </p>
                                  
                                  {/* Phase 4: Conflict Warning */}
                                  {conflictShift && !isSelected && !isLead && (
                                    <p className="text-[8px] font-black text-amber-500 flex items-center gap-1 mt-0.5">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      Scheduled {format(parseISO(conflictShift.startTime), "HH:mm")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Phase 2: Make Lead Action */}
                            {isSelected && !isLead && !isReadOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShiftLeadId(emp.id);
                                }}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-all group/lead"
                                title="Set as Lead"
                              >
                                <Star className="w-4 h-4 group-hover/lead:fill-white" />
                              </button>
                            )}

                            {isSelected && !isLead && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    /* Phase 3: Empty State Polish */
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                        <UserRoundMinus className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">No matches found</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                        {searchQuery ? `No employees found matching "${searchQuery}"` : "No assigned employees for this shift"}
                      </p>
                      {!isReadOnly && searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              {isReadOnly ? (
                <div className="w-full flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                  >
                    Close Details
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                      Discard
                    </button>
                    {onDelete && (
                      <button
                        onClick={onDelete}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {!isMobile && <span className="text-xs font-bold">Delete Shift</span>}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSave}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Commit Shift
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShiftModal;
