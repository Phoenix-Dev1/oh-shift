import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function POST(req: Request) {
  const body = await req.json();
  const { employeeId, managerId } = body;

  if (!employeeId || !managerId) {
    return NextResponse.json(
      { error: "Both employeeId and managerId are required" },
      { status: 400 }
    );
  }

  try {
    // Update employee with employeeManagerId
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: {
        employeeManagerId: managerId,
      },
    });

    return NextResponse.json({ employee: updatedEmployee }, { status: 200 });
  } catch (error: any) {
    console.error("Error assigning manager:", error);
    if (error.code === "404") {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  // Get the current logged-in user (manager)
  const user = await getCurrentUser();
  const managerId = user?.id;

  // Parse request body
  const { employeeId } = await req.json();

  if (!employeeId || !managerId) {
    return NextResponse.json(
      { error: "Employee ID and Manager ID are required" },
      { status: 400 }
    );
  }

  try {
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { employeeManagerId: managerId },
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Error assigning manager:", error);
    return NextResponse.json(
      { error: "Failed to assign manager" },
      { status: 500 }
    );
  }
}
