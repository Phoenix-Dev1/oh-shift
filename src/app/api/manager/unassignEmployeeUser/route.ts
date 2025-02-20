// src/app/api/manager/unassignEmployeeUser/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const { employeeId } = body;

    // Validate that the employee is managed by the current manager.
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee || employee.managerId !== currentUser.id) {
      return NextResponse.json({ error: "Invalid employee" }, { status: 400 });
    }

    // Delete the assignment record (if any) using deleteMany.
    await prisma.employeeUserAssignment.deleteMany({
      where: { employeeId },
    });

    return NextResponse.json(
      { message: "Employee unassigned successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error unassigning employee:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
