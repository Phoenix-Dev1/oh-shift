// src/app/api/employees/dashboard/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

// Helper: get the start of the week (Sunday) for a given date
function getStartOfWeek(date: Date): Date {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

/**
 * Helper: Given a year, month, and weekIndex (1-indexed), returns the start and end
 * dates of that week within the month. We define:
 *  - If the month starts on Sunday, week 1 starts on the 1st.
 *  - Otherwise, week 1 runs from the 1st to the first Saturday.
 *  - Subsequent weeks run from Sunday to Saturday.
 * The boundaries are clamped to the month.
 */
function getWeekPeriod(
  year: number,
  month: number,
  weekIndex: number
): { start: Date; end: Date } {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  let start: Date, end: Date;

  if (firstDayOfMonth.getDay() === 0) {
    // Month starts on Sunday: week1 starts on the 1st.
    start = new Date(firstDayOfMonth);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else {
    if (weekIndex === 1) {
      // Week 1: from the 1st to the first Saturday.
      start = new Date(firstDayOfMonth);
      start.setHours(0, 0, 0, 0);
      end = new Date(firstDayOfMonth);
      const daysToSaturday = 6 - firstDayOfMonth.getDay();
      end.setDate(end.getDate() + daysToSaturday);
    } else {
      // For week 2 and beyond, determine the first Sunday in the month.
      const firstSunday = new Date(firstDayOfMonth);
      if (firstSunday.getDay() !== 0) {
        firstSunday.setDate(firstSunday.getDate() + (7 - firstSunday.getDay()));
      }
      start = new Date(firstSunday);
      start.setDate(start.getDate() + (weekIndex - 2) * 7);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    }
  }

  // Clamp the end to the last day of the month.
  if (end > lastDayOfMonth) {
    end = new Date(lastDayOfMonth);
    // Set to the end of that day.
    end.setHours(23, 59, 59, 999);
  } else {
    // Otherwise, set end to Saturday's end.
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const weekParam = searchParams.get("week");

    let periodStart: Date, periodEnd: Date;
    if (yearParam && monthParam && weekParam) {
      const year = Number(yearParam);
      const month = Number(monthParam);
      const weekIndex = Number(weekParam);
      ({ start: periodStart, end: periodEnd } = getWeekPeriod(
        year,
        month,
        weekIndex
      ));
    } else if (yearParam && monthParam) {
      // Entire month: from the first day to the last day
      const year = Number(yearParam);
      const month = Number(monthParam);
      periodStart = new Date(year, month - 1, 1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(year, month, 0);
      periodEnd.setHours(23, 59, 59, 999);
    } else {
      // Default: current week based on Sunday start
      periodStart = getStartOfWeek(new Date());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all employees for the current manager.
    const employees = await prisma.employee.findMany({
      where: { managerId: currentUser.id },
    });

    // For each employee, calculate aggregates for the given period.
    const results = await Promise.all(
      employees.map(async (employee) => {
        const assignments = await prisma.shiftAssignment.findMany({
          where: {
            employeeId: employee.id,
            shift: {
              startTime: { gte: periodStart },
              endTime: { lte: periodEnd },
            },
          },
          include: { shift: true },
        });

        const shiftCount = assignments.length;
        const totalHours = assignments.reduce((sum, assignment) => {
          const duration =
            (new Date(assignment.shift.endTime).getTime() -
              new Date(assignment.shift.startTime).getTime()) /
            (1000 * 3600);
          return sum + duration;
        }, 0);

        return {
          id: employee.id,
          name: employee.name,
          shiftCount,
          totalHours,
        };
      })
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching employee aggregates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
