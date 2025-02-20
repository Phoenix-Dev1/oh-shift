// src/app/api/manager/assignEmployeeUser/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, userId } = body;
    if (!employeeId || !userId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Validate that the employee belongs to the current manager.
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee || employee.managerId !== currentUser.id) {
      return NextResponse.json({ error: "Invalid employee" }, { status: 400 });
    }

    // Validate that the user is managed by the current manager.
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.employeeManagerId !== currentUser.id) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Check if an assignment already exists for this employee.
    const existingAssignment = await prisma.employeeUserAssignment.findUnique({
      where: { employeeId },
    });
    if (existingAssignment) {
      return NextResponse.json(
        { error: "Employee already assigned" },
        { status: 400 }
      );
    }

    // Create the connection record.
    const assignment = await prisma.employeeUserAssignment.create({
      data: {
        employee: { connect: { id: employeeId } },
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json(assignment, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error assigning employee user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("An unknown error occurred in assigning employee user.");
    }
    return null;
  }
}
