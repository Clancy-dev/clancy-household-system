import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  })

  return NextResponse.json({
    role: existingAdmin ? "USER" : "ADMIN",
  })
}