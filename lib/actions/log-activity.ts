// actions/log-activity.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  metadata,
}: {
  userId: string;
  action: string;
  metadata?: any;
}) {
  return prisma.activity.create({
    data: {
      userId,
      action,
      metadata,
    },
  });
}