import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

// Assign a Manager (POST)
export async function POST(req: Request) {
  try {
    const body: Record<string, unknown> = await req.json();
    const employeeId = body.employeeId as string | undefined;
    const managerId = body.managerId as string | undefined;

    if (!employeeId || !managerId) {
      return NextResponse.json(
        { error: "Both employeeId and managerId are required" },
        { status: 400 }
      );
    }

    // Update employee with managerId
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { employeeManagerId: managerId },
    });

    return NextResponse.json({ employee: updatedEmployee }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error assigning manager:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// Assign a Manager (PATCH) - Uses Logged-In User as Manager
export async function PATCH(req: Request) {
  try {
    // Get the current logged-in user (manager)
    const user = await getCurrentUser();
    const managerId = user?.id;

    // Parse request body
    const body: Record<string, unknown> = await req.json();
    const employeeId = body.employeeId as string | undefined;

    if (!employeeId || !managerId) {
      return NextResponse.json(
        { error: "Employee ID and Manager ID are required" },
        { status: 400 }
      );
    }

    // Update employee's managerId
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { employeeManagerId: managerId },
    });

    return NextResponse.json({ employee: updatedEmployee }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error assigning manager:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to assign manager",
      },
      { status: 500 }
    );
  }
}
