"use server";

import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { businessDayStartHour: 7 };
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { businessDayStartHour: true }
    });

    return { businessDayStartHour: user?.businessDayStartHour ?? 7 };
  } catch (error: unknown) {
    console.error("Error fetching user settings", error);
    return { businessDayStartHour: 7 };
  }
}

export async function updateBusinessDayStartHour(hour: number) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    if (hour < 0 || hour > 23) {
      throw new Error("Invalid hour");
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { businessDayStartHour: hour }
    });

    revalidatePath("/dashboard/manager/settings");
    revalidatePath("/calendar");
    
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating businessDayStartHour", error);
    throw new Error("Failed to update businessDayStartHour");
  }
}
