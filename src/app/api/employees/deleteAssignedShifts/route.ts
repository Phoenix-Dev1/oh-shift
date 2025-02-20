import { NextResponse } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse the request body to get the employee ID
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }
    const { id } = body;

    // Step 1: Find all ShiftAssignments for this employee.
    const assignments = await prisma.shiftAssignment.findMany({
      where: { employeeId: id },
      select: { shiftId: true },
    });

    // Extract distinct shift IDs that this employee is assigned to.
    const shiftIds = Array.from(
      new Set(assignments.map((assignment) => assignment.shiftId))
    );

    // Step 2: Delete all assignments for this employee.
    await prisma.shiftAssignment.deleteMany({
      where: { employeeId: id },
    });

    // Step 3: For each shift, check if there are any assignments remaining.
    for (const shiftId of shiftIds) {
      const remainingCount = await prisma.shiftAssignment.count({
        where: { shiftId },
      });
      // If no assignments remain, delete the shift as well.
      if (remainingCount === 0) {
        await prisma.shift.delete({
          where: { id: shiftId },
        });
      }
    }

    return NextResponse.json(
      { message: "All assigned shifts removed (and empty shifts deleted)." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assigned shifts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
