import { NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";
import getCurrentUser from "../../../actions/getCurrentUser";

export async function PATCH(
  req: Request,
  context: { params: { id: string } } // Corrected structure
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, position, phone } = await req.json();

    const updatedEmployee = await prisma.employee.update({
      where: { id: context.params.id }, // Use context.params
      data: {
        name,
        position,
        phone,
      },
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
  req: Request,
  context: { params: { id: string } } // Fixed here as well
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.employee.delete({
      where: { id: context.params.id }, // Use context.params
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
