"use server"

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "./log-activity";



// ============================
// ADMIN: GET ALL ACTIVITY (NO LOG)
// ============================
export async function getAllActivity(page = 1, perPage = 20) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const skip = (page - 1) * perPage;

  const [total, activityLogs] = await Promise.all([
    prisma.activity.count(),
    prisma.activity.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
    }),
  ]);

  return { total, activityLogs };
}


// ============================
// USER: GET OWN ACTIVITY (NO LOG)
// ============================
export async function getMyActivity(userId: string, page = 1, perPage = 20) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const skip = (page - 1) * perPage;

  const [total, activityLogs] = await Promise.all([
    prisma.activity.count({ where: { userId } }),
    prisma.activity.findMany({
      where: { userId },
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
       include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },

    }),
  ]);

  return { total, activityLogs };
}


// ============================
// ADMIN: UPDATE USER ROLE (LOG THIS)
// ============================
export async function updateUserRole(userId: string, newRole: "ADMIN" | "USER") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // ✅ LOG ACTIVITY (IMPORTANT)
  await logActivity({
    userId: session.user.id,
    action: "UPDATED_USER_ROLE",
    metadata: {
      targetUserId: userId,
      newRole,
    },
  });

  return updatedUser;
}


// ============================
// ADMIN: GET ALL USERS (NO LOG)
// ============================
export async function getAllUsers(search = "", roleFilter?: "ADMIN" | "USER") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (roleFilter) where.role = roleFilter;

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}