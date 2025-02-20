// src/app/api/manager/employeeAssignments/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignments = await prisma.employeeUserAssignment.findMany({
      where: {
        employee: {
          managerId: currentUser.id,
        },
      },
      include: {
        employee: {
          select: { id: true },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(assignments, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching employee assignments:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Error fetching employee assignments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
