// src/app/api/users/manager/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../libs/prismadb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");
    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { name: true },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    return NextResponse.json(manager, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching manager:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
