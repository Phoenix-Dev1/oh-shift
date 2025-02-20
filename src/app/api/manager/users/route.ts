// src/app/api/manager/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function GET(_request: NextRequest) {
  void _request; // Mark as used to prevent unused variable error.
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    // Query for users assigned to the current manager
    const managerUsers = await prisma.user.findMany({
      where: {
        employeeManagerId: currentUser.id,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    return NextResponse.json(managerUsers, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching manager users:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Error fetching manager users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
