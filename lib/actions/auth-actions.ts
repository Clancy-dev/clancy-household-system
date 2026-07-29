"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logActivity } from "./log-activity"


export async function registerAction(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // ============================
  // VALIDATION
  // ============================
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { success: false, error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      field: "confirmPassword",
      error: "Passwords do not match",
    }
  }

  // ============================
  // CHECK EXISTING USER
  // ============================
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { success: false, field: "email", error: "Email is already registered" }
  }

  // ============================
  // DETERMINE ROLE
  // ============================
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  const role = existingAdmin ? "USER" : "ADMIN"

  // ============================
  // HASH PASSWORD
  // ============================
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      },
    })

    // ✅ LOG ACTIVITY (ONLY ON SUCCESS)
    await logActivity({
      userId: user.id,
      action: "REGISTERED",
      metadata: {
        email: user.email,
        role: user.role,
      },
    })

    return { success: true, user }

  } catch (err) {
    console.error("Error creating user:", err)
    return { success: false, error: "Failed to create user" }
  }
}