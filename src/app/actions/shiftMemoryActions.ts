"use server";

import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { revalidatePath } from "next/cache";

/**
 * Phase 2: Action 1 - Fetch recent shift titles from the database
 */
export async function getRecentShiftTitles() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { recentShiftTitles: true }
    });

    return (user?.recentShiftTitles as string[]) || [];
  } catch (error: unknown) {
    console.error("Error fetching recent shift titles:", error);
    return [];
  }
}

/**
 * Phase 2: Action 2 - Persist a new shift title and maintain the last 5 unique titles
 */
export async function saveRecentShiftTitle(newTitle: string) {
  try {
    if (!newTitle || newTitle.trim() === "") return null;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { recentShiftTitles: true }
    });

    const trimmedTitle = newTitle.trim();
    const currentTitles = (user?.recentShiftTitles as string[]) || [];
    
    const updatedTitles = [
      trimmedTitle,
      ...currentTitles.filter((t: string) => t !== trimmedTitle)
    ].slice(0, 5);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        recentShiftTitles: updatedTitles
      }
    });

    revalidatePath("/calendar");
    return updatedUser.recentShiftTitles;
  } catch (error: unknown) {
    console.error("Error saving recent shift title:", error);
    return null;
  }
}

/**
 * Action: Remove a specific shift title from the manager's history
 */
export async function removeRecentShiftTitle(titleToRemove: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { recentShiftTitles: true }
    });

    const currentTitles = (user?.recentShiftTitles as string[]) || [];
    const updatedTitles = currentTitles.filter(
      (t: string) => t !== titleToRemove
    );

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        recentShiftTitles: updatedTitles
      }
    });

    revalidatePath("/calendar");
    return updatedUser.recentShiftTitles;
  } catch (error: unknown) {
    console.error("Error removing recent shift title:", error);
    return null;
  }
}
