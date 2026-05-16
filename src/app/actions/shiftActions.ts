"use server";

import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getManagerShifts() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const shifts = await prisma.shift.findMany({
    where: { managerId: currentUser.id },
    include: {
      assignments: { include: { employee: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return shifts;
}

export async function createShift(data: {
  startTime: string | Date;
  endTime: string | Date;
  employees: string[];
  allDay: boolean;
  title?: string | null;
  shiftLeadId?: string | null;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const { startTime, endTime, employees, allDay, title } = data;
  const adjustedStart = new Date(startTime);
  const adjustedEnd = new Date(endTime);
  if (allDay) {
    adjustedStart.setHours(0, 0, 0, 0);
    adjustedEnd.setHours(23, 59, 59, 999);
  }

  const createData: Prisma.ShiftUncheckedCreateInput = {
    startTime: adjustedStart,
    endTime: adjustedEnd,
    managerId: currentUser.id,
    allDay: allDay ?? false,
    title: title || (allDay ? "New All Day Shift" : "Standard Shift"),
    shiftLeadId: data.shiftLeadId,
    assignments: {
      create: employees.map((employeeId: string) => ({
        employeeId: employeeId,
      })),
    },
  };

  const newShift = await prisma.shift.create({
    data: createData,
    include: { assignments: { include: { employee: true } } },
  });

  revalidatePath("/calendar");
  return newShift;
}

export async function updateShift(data: {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  employees?: string[];
  allDay?: boolean;
  title?: string | null;
  shiftLeadId?: string | null;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const { id, startTime, endTime, employees, allDay, title } = data;

  const adjustedStart = new Date(startTime);
  const adjustedEnd = new Date(endTime);
  if (allDay) {
    adjustedStart.setHours(0, 0, 0, 0);
    adjustedEnd.setHours(23, 59, 59, 999);
  }

  const updateData: Prisma.ShiftUncheckedUpdateInput = {
    startTime: adjustedStart,
    endTime: adjustedEnd,
    allDay: allDay ?? false,
    title: title || (allDay ? "New All Day Shift" : "Standard Shift"),
    shiftLeadId: data.shiftLeadId,
  };

  if (employees && Array.isArray(employees)) {
    updateData.assignments = {
      deleteMany: {},
      create: employees.map((employeeId: string) => ({
        employeeId: employeeId,
      })),
    };
  }

  const updatedShift = await prisma.shift.update({
    where: { id },
    data: updateData,
    include: { assignments: { include: { employee: true } } },
  });

  revalidatePath("/calendar");
  return updatedShift;
}

export async function deleteShiftAction(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift || shift.managerId !== currentUser.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.shift.delete({ where: { id } });

  revalidatePath("/calendar");
  return { success: true };
}
