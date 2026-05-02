"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getManagerShifts, createShift, updateShift, deleteShiftAction } from "../../actions/shiftActions";
import { getEmployees } from "../../actions/getEmployees";
import { Shift, Employee } from "../../types";
import { toast } from "react-toastify";

export const useShiftBoard = () => {
  const queryClient = useQueryClient();

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
          old?.map((s) => (s.id === newShift.id ? { ...s, ...newShift } : s))
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
    isLoading: isLoadingShifts || isLoadingEmployees,
    createShift: createMutation.mutate,
    updateShift: updateMutation.mutate,
    deleteShift: deleteMutation.mutate,
  };
};
