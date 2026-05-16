import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Attempt to resolve managerId more robustly
    let managerId = currentUser.employeeManagerId;

    if (!managerId) {
      // Find the employee record linked to this user
      const employee = await prisma.employee.findFirst({
        where: {
          assignment: {
            userId: currentUser.id
          }
        }
      });
      managerId = employee?.managerId || null;
    }

    if (!managerId) {
      console.warn(`No manager or employee record found for user ${currentUser.id}`);
      return NextResponse.json([], { status: 200 });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        OR: [
          { managerId: managerId || undefined },
          {
            assignments: {
              some: {
                employee: {
                  assignment: {
                    userId: currentUser.id
                  }
                }
              }
            }
          }
        ]
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
