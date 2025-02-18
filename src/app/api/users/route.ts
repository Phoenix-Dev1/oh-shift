import { NextResponse } from "next/server";
import prisma from "../../libs/prismadb";

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
        employeeManagerId: true,
      },
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
