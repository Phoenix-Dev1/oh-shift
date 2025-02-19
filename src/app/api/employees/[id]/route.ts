import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, position, phone } = await req.json();

    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Employee deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
