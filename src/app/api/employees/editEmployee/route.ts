import { NextResponse } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const { id, name, position, phone } = body;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { name, position, phone },
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
