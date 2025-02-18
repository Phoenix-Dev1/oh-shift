// src/app/api/shifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

// Get All Shifts
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        managerId: currentUser.id,
      },
      include: {
        assignments: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(shifts, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts", details: error.message },
      { status: 500 }
    );
  }
}

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

    let adjustedStart = new Date(startTime);
    let adjustedEnd = new Date(endTime);
    if (allDay) {
      adjustedStart.setHours(0, 0, 0, 0);
      adjustedEnd.setHours(0, 0, 0, 0);
      // Do NOT add an extra day here—assume the frontend sends the correct end time.
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
            employee: {
              connect: { id: employeeId },
            },
          })),
        },
      },
      include: {
        assignments: {
          include: { employee: true },
        },
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }
}

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

    let adjustedStart = new Date(startTime);
    let adjustedEnd = new Date(endTime);
    if (allDay) {
      adjustedStart.setHours(0, 0, 0, 0);
      adjustedEnd.setHours(0, 0, 0, 0);
      // Do NOT add an extra day here.
    }

    const updateData: any = {
      startTime: adjustedStart,
      endTime: adjustedEnd,
      allDay: allDay ?? false,
    };

    if (allDay) {
      updateData.title = title || "New All Day Shift";
    } else {
      updateData.title = null;
    }

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
      include: {
        assignments: {
          include: { employee: true },
        },
      },
    });

    return NextResponse.json(updatedShift, { status: 200 });
  } catch (error: any) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: "Failed to update shift", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE Shift with Cascade on ShiftAssignments
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use req.nextUrl.searchParams for Next.js 13 app directory
    const shiftId = req.nextUrl.searchParams.get("id");

    if (!shiftId) {
      return NextResponse.json(
        { error: "Shift ID is required." },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    if (shift.managerId !== currentUser.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this shift." },
        { status: 403 }
      );
    }

    // Delete the shift; Prisma will cascade delete related ShiftAssignments
    await prisma.shift.delete({
      where: { id: shiftId },
    });

    return NextResponse.json(
      { message: "Shift deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: "Failed to delete shift", details: error.message },
      { status: 500 }
    );
  }
}
