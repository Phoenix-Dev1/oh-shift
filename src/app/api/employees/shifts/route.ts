// src\app\api\employees\shifts\route

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../app/libs/prismadb";
import getCurrentUser from "../../../../app/actions/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the employee entry for the user
    const employeeUserAssignment =
      await prisma.employeeUserAssignment.findUnique({
        where: { userId: currentUser.id },
        include: { employee: true },
      });

    if (!employeeUserAssignment || !employeeUserAssignment.employee) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 }
      );
    }

    const employee = employeeUserAssignment.employee;

    // Extract month and year from query params
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    let shiftSummary = null;
    if (yearParam && monthParam) {
      const year = Number(yearParam);
      const month = Number(monthParam);

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

      shiftSummary = { totalShifts, totalHours };
    }

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

    return NextResponse.json({
      employee,
      upcomingShifts,
      shiftSummary,
    });
  } catch (error) {
    console.error("Error fetching employee shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee shifts" },
      { status: 500 }
    );
  }
}
