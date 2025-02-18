import { NextResponse } from "next/server";
import prisma from "../../libs/prismadb";
import getCurrentUser from "../../actions/getCurrentUser";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) {
    return NextResponse.json(
      { error: "Manager ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch shifts by manager ID
    const shifts = await prisma.shift.findMany({
      where: {
        managerId: managerId,
      },
      include: {
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    });

    return NextResponse.json({ shifts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create or update schedule
    const schedule = await prisma.schedule.upsert({
      where: {
        managerId: currentUser.id,
      },
      update: {
        startDate: new Date(),
        endDate: new Date(),
        isPublic: true,
      },
      create: {
        startDate: new Date(),
        endDate: new Date(),
        isPublic: true,
        managerId: currentUser.id,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating schedule:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
