// src\app\actions\getEmployeeShifts

import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export const getEmployeeShifts = async () => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      throw new Error("Unauthorized access");
    }

    // Find the employee entry for the user
    const employeeUserAssignment =
      await prisma.employeeUserAssignment.findUnique({
        where: { userId: currentUser.id },
        include: { employee: true },
      });

    if (!employeeUserAssignment || !employeeUserAssignment.employee) {
      throw new Error("Employee record not found");
    }

    const employee = employeeUserAssignment.employee;

    // Fetch upcoming 10 shifts for the employee
    const upcomingShifts = await prisma.shift.findMany({
      where: {
        assignments: {
          some: {
            employeeId: employee.id,
          },
        },
        startTime: { gte: new Date() }, // Only future shifts
      },
      orderBy: { startTime: "asc" },
      take: 10, // Limit to next 10 shifts
    });

    return {
      employee,
      upcomingShifts,
    };
  } catch (error) {
    console.error("Error fetching employee shifts:", error);
    return null;
  }
};

export const getEmployeeShiftSummary = async (year: number, month: number) => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      throw new Error("Unauthorized access");
    }

    // Find employee entry
    const employeeUserAssignment =
      await prisma.employeeUserAssignment.findUnique({
        where: { userId: currentUser.id },
        include: { employee: true },
      });

    if (!employeeUserAssignment || !employeeUserAssignment.employee) {
      throw new Error("Employee record not found");
    }

    const employee = employeeUserAssignment.employee;

    // Define month range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999); // Set end of day

    // Fetch shifts for the selected month
    const shifts = await prisma.shift.findMany({
      where: {
        assignments: {
          some: {
            employeeId: employee.id,
          },
        },
        startTime: { gte: startDate, lte: endDate },
      },
    });

    // Calculate total shifts and hours worked
    const totalShifts = shifts.length;
    const totalHours = shifts.reduce((sum, shift) => {
      const duration =
        (new Date(shift.endTime).getTime() -
          new Date(shift.startTime).getTime()) /
        (1000 * 3600);
      return sum + duration;
    }, 0);

    return { totalShifts, totalHours };
  } catch (error) {
    console.error("Error fetching shift summary:", error);
    return null;
  }
};
