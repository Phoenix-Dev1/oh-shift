"use server";

import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { revalidatePath } from "next/cache";

/**
 * Phase 2: Action 1 - Fetch recent shift titles from the database
 */
export async function getRecentShiftTitles() {
  try {
    const currentUser = (await getCurrentUser()) as any;
    
    if (!currentUser) {
      return [];
    }

    return (currentUser.recentShiftTitles as string[]) || [];
  } catch (error) {
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
    
    const currentUser = (await getCurrentUser()) as any;
    if (!currentUser) return null;

    const trimmedTitle = newTitle.trim();
    
    const updatedTitles = [
      trimmedTitle,
      ...(currentUser.recentShiftTitles || []).filter((t: string) => t !== trimmedTitle)
    ].slice(0, 5);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        recentShiftTitles: updatedTitles
      } as any
    });

    revalidatePath("/calendar");
    return (updatedUser as any).recentShiftTitles;
  } catch (error) {
    console.error("Error saving recent shift title:", error);
    return null;
  }
}

/**
 * Action: Remove a specific shift title from the manager's history
 */
export async function removeRecentShiftTitle(titleToRemove: string) {
  try {
    const currentUser = (await getCurrentUser()) as any;
    if (!currentUser) return null;

    const updatedTitles = (currentUser.recentShiftTitles || []).filter(
      (t: string) => t !== titleToRemove
    );

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        recentShiftTitles: updatedTitles
      } as any
    });

    revalidatePath("/calendar");
    return (updatedUser as any).recentShiftTitles;
  } catch (error) {
    console.error("Error removing recent shift title:", error);
    return null;
  }
}
