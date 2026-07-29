"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "./log-activity";

// ============================
// GET ALL USERS (ADMIN ONLY)
// ============================
export async function getAllUsers() {
  const session = await getServerSession(authOptions);

  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });


  return users;
}

// ============================
// GET CURRENT USER DATA
// ============================
export async function getUserData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }


    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { success: false, error: "Failed to fetch user data" };
  }
}

// ============================
// UPDATE USER PROFILE
// ============================
export async function updateUserProfileAction(
  firstName: string,
  lastName: string,
  avatar?: string
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return {
        success: false,
        error: "First name and last name are required",
      };
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    // ✅ LOG (ONLY ON SUCCESS)
    await logActivity({
      userId: user.id,
      action: "UPDATE_PROFILE",
      metadata: {
        email: user.email,
        updatedFields: {
          firstName: true,
          lastName: true,
          avatar: !!avatar,
        },
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}