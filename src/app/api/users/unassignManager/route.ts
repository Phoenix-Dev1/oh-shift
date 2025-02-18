import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function PATCH(req: Request) {
  // Get current user (manager)
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
    // Set employeeManagerId to null to unassign
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { employeeManagerId: null },
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Error unassigning manager:", error);
    return NextResponse.json(
      { error: "Failed to unassign manager" },
      { status: 500 }
    );
  }
}
