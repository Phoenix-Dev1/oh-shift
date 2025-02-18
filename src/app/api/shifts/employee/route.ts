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
  } catch (error: any) {
    console.error("Error fetching employee shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts", details: error.message },
      { status: 500 }
    );
  }
}
