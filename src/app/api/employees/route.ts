// src/app/api/employees/route.ts

import { NextResponse } from "next/server";
import prisma from "../../libs/prismadb";
import getCurrentUser from "../../actions/getCurrentUser";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, position } = await req.json();

    if (!name || !position) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        position,
        managerId: currentUser.id,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const employees = await prisma.employee.findMany({
      where: {
        managerId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
