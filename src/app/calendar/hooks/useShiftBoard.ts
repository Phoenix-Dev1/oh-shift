"use client";

import { useState, useEffect } from "react";
import { subDays, subWeeks, subMonths, addDays, addWeeks, addMonths } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getManagerShifts, createShift, updateShift, deleteShiftAction } from "../../actions/shiftActions";
import { getEmployees } from "../../actions/getEmployees";
import { Shift, Employee } from "../../types";
import { toast } from "sonner";
import useIsMobile from "../../hooks/useIsMobile";

export type ViewMode = 'month' | 'week' | 'day';

export const useShiftBoard = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Phase 2: View Management State
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Phase 2: Responsive Default
  useEffect(() => {
    if (isMobile) {
      setViewMode('day');
    } else {
      setViewMode('week');
    }
  }, [isMobile]);

  // Phase 1: Navigation Logic
  const handleToday = () => setCurrentDate(new Date());

  const handlePrevious = () => {
    setCurrentDate((prev) => {
      if (viewMode === 'day') return subDays(prev, 1);
      if (viewMode === 'week') return subWeeks(prev, 1);
      return subMonths(prev, 1);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (viewMode === 'day') return addDays(prev, 1);
      if (viewMode === 'week') return addWeeks(prev, 1);
      return addMonths(prev, 1);
    });
  };

  // Queries
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const data = await getManagerShifts();
      // Map Prisma response to our Shift type
      return data.map((s: any) => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        employees: s.assignments.map((a: any) => a.employee),
      })) as Shift[];
    },
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const data = await getEmployees();
      return data as Employee[];
    },
  });

  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      // Inline import to avoid circular dependencies if any
      const { getUserSettings } = await import("../../actions/userSettingsActions");
      return await getUserSettings();
    },
  });

  const businessDayStartHour = userSettings?.businessDayStartHour ?? 7;

  // Mutations
  const createMutation = useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift created successfully");
    },
    onError: () => toast.error("Failed to create shift"),
  });

  const updateMutation = useMutation({
    mutationFn: updateShift,
    onMutate: async (newShift) => {
      await queryClient.cancelQueries({ queryKey: ["shifts"] });
      const previousShifts = queryClient.getQueryData<Shift[]>(["shifts"]);

      if (previousShifts) {
        queryClient.setQueryData<Shift[]>(["shifts"], (old) =>
          old?.map((s) => {
            if (s.id === newShift.id) {
              // Fix Optimistic UI: Map string IDs back to full Employee objects
              const updatedEmployees = newShift.employees 
                ? newShift.employees.map((empIdOrObj: any) => {
                    if (typeof empIdOrObj === 'string') {
                      // Attempt to find the full employee object from our cache
                      return employees.find(e => e.id === empIdOrObj) || { id: empIdOrObj, name: "Unknown" };
                    }
                    return empIdOrObj;
                  })
                : s.employees;

              return {
                ...s,
                ...newShift,
                employees: updatedEmployees,
                startTime: newShift.startTime instanceof Date ? newShift.startTime.toISOString() : newShift.startTime,
                endTime: newShift.endTime instanceof Date ? newShift.endTime.toISOString() : newShift.endTime,
              } as Shift;
            }
            return s;
          })
        );
      }

      return { previousShifts };
    },
    onError: (err, newShift, context) => {
      if (context?.previousShifts) {
        queryClient.setQueryData(["shifts"], context.previousShifts);
      }
      toast.error("Failed to update shift");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onSuccess: () => toast.success("Shift updated successfully"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShiftAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted successfully");
    },
    onError: () => toast.error("Failed to delete shift"),
  });

  return {
    shifts,
    employees,
    isLoading: isLoadingShifts || isLoadingEmployees || isLoadingSettings,
    viewMode,
    setViewMode,
    currentDate,
    handleToday,
    handlePrevious,
    handleNext,
    businessDayStartHour,
    createShift: createMutation.mutate,
    updateShift: updateMutation.mutate,
    deleteShift: deleteMutation.mutate,
  };
};
