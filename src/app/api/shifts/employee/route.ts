import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (
      !currentUser ||
      currentUser.role !== "EMPLOYEE" ||
      !currentUser.employeeManagerId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        managerId: currentUser.employeeManagerId,
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
  } catch (error: unknown) {
    console.error(
      "Error fetching employee shifts:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
