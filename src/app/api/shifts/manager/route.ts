import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";
import { Prisma } from "@prisma/client";

// Get All Shifts (Manager Only)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shifts = await prisma.shift.findMany({
      where: { managerId: currentUser.id },
      include: {
        assignments: { include: { employee: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(shifts, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Create New Shift (Manager Only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { startTime, endTime, employees, allDay, title } = await req.json();

    if (!startTime || !endTime || !Array.isArray(employees)) {
      return NextResponse.json(
        { error: "Invalid or missing fields." },
        { status: 400 }
      );
    }

    const adjustedStart = new Date(startTime);
    const adjustedEnd = new Date(endTime);
    if (allDay) {
      adjustedStart.setHours(0, 0, 0, 0);
      adjustedEnd.setHours(23, 59, 59, 999);
    }

    const newShift = await prisma.shift.create({
      data: {
        startTime: adjustedStart,
        endTime: adjustedEnd,
        managerId: currentUser.id,
        allDay: allDay ?? false,
        title: allDay ? title || "New All Day Shift" : null,
        assignments: {
          create: employees.map((employeeId: string) => ({
            employee: { connect: { id: employeeId } },
          })),
        },
      },
      include: { assignments: { include: { employee: true } } },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Update Shift (Manager Only)
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, startTime, endTime, employees, allDay, title } =
      await req.json();

    if (!id || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Invalid or missing fields." },
        { status: 400 }
      );
    }

    const adjustedStart = new Date(startTime);
    const adjustedEnd = new Date(endTime);
    if (allDay) {
      adjustedStart.setHours(0, 0, 0, 0);
      adjustedEnd.setHours(23, 59, 59, 999);
    }

    // Use Prisma.ShiftUpdateInput to avoid explicit 'any'
    const updateData: Prisma.ShiftUpdateInput = {
      startTime: adjustedStart,
      endTime: adjustedEnd,
      allDay: allDay ?? false,
      title: allDay ? title || "New All Day Shift" : null,
    };

    if (employees && Array.isArray(employees) && employees.length > 0) {
      updateData.assignments = {
        deleteMany: {},
        create: employees.map((employeeId: string) => ({
          employee: { connect: { id: employeeId } },
        })),
      };
    }

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: { assignments: { include: { employee: true } } },
    });

    return NextResponse.json(updatedShift, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE Shift (Cascade Delete Assignments)
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shiftId = req.nextUrl.searchParams.get("id");
    if (!shiftId) {
      return NextResponse.json(
        { error: "Shift ID is required." },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    if (shift.managerId !== currentUser.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this shift." },
        { status: 403 }
      );
    }

    await prisma.shift.delete({ where: { id: shiftId } });

    return NextResponse.json(
      { message: "Shift deleted successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
