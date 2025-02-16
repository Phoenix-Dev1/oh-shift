// src/app/api/shifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../libs/prismadb";

// Get All Shifts
export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
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
    const { startTime, endTime, employees } = await req.json();

    console.log("Received payload:", { startTime, endTime, employees });

    if (!startTime || !endTime || !Array.isArray(employees)) {
      return NextResponse.json(
        { error: "Invalid or missing fields." },
        { status: 400 }
      );
    }

    // Create Shift with Assignments
    const newShift = await prisma.shift.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        assignments: {
          create: employees.map((employeeId: string) => ({
            employee: {
              connect: { id: employeeId },
            },
          })),
        },
      },
      include: { assignments: true },
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
