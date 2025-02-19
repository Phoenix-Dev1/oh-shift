import { NextResponse } from "next/server";
import prisma from "@/src/app/libs/prismadb";
import getCurrentUser from "@/src/app/actions/getCurrentUser";

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const { id } = body;

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
