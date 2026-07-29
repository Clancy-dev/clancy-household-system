"use server";

import { prisma } from "@/lib/prisma";
import {
  maintenanceItemSchema,
  type MaintenanceItemFormData,
} from "@/lib/validations/maintenance";
import { Prisma } from "../generated/prisma/client";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};



// =====================================
// GET ALL MAINTENANCE ITEMS
// =====================================

export async function getMaintenanceItems(): Promise<ActionResponse<any[]>> {
  try {
    const items = await prisma.maintenanceItem.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("[getMaintenanceItems] Error:", error);

    return {
      success: false,
      error: "Failed to fetch maintenance items",
    };
  }
}

// =====================================
// GET DELETED MAINTENANCE ITEMS
// =====================================

export async function getDeletedMaintenanceItems(): Promise<ActionResponse<any[]>> {
  try {
    const items = await prisma.maintenanceItem.findMany({
      where: {
        isDeleted: true,
      },
      orderBy: {
        deletedAt: "desc",
      },
    })

    return {
      success: true,
      data: items,
    }
  } catch (error) {
    console.error("[getDeletedMaintenanceItems] Error:", error)

    return {
      success: false,
      error: "Failed to fetch deleted maintenance items",
    }
  }
}


// =====================================
// GET ITEMS BY CATEGORY
// =====================================

export async function getMaintenanceItemsByCategory(
  category: string
): Promise<ActionResponse<any[]>> {
  try {
    const items = await prisma.maintenanceItem.findMany({
      where: {
        category,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("[getMaintenanceItemsByCategory] Error:", error);

    return {
      success: false,
      error: "Failed to fetch maintenance items",
    };
  }
}


// =====================================
// GET SINGLE ITEM
// =====================================

export async function getMaintenanceItem(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const item = await prisma.maintenanceItem.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return {
        success: false,
        error: "Maintenance item not found",
      };
    }

    return {
      success: true,
      data: item,
    };
  } catch (error) {
    console.error("[getMaintenanceItem] Error:", error);

    return {
      success: false,
      error: "Failed to fetch maintenance item",
    };
  }
}


// =====================================
// DELETE ITEM
// =====================================

export async function deleteMaintenanceItem(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await prisma.maintenanceItem.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("[deleteMaintenanceItem] Error:", error);

    return {
      success: false,
      error: "Failed to delete maintenance item",
    };
  }
}


// =====================================
// RESTORE ITEM
// =====================================

export async function restoreMaintenanceItem(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const item = await prisma.maintenanceItem.update({
      where: {
        id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      success: true,
      data: item,
    };
  } catch (error) {
    console.error("[restoreMaintenanceItem] Error:", error);

    return {
      success: false,
      error: "Failed to restore maintenance item",
    };
  }
}


// =====================================
// PERMANENT DELETE
// =====================================

export async function permanentlyDeleteMaintenanceItem(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await prisma.maintenanceItem.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(
      "[permanentlyDeleteMaintenanceItem] Error:",
      error
    );

    return {
      success: false,
      error: "Failed to permanently delete maintenance item",
    };
  }
}
// =====================================
// CREATE MAINTENANCE ITEM
// =====================================

export async function createMaintenanceItem(
  data: MaintenanceItemFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = maintenanceItemSchema.parse(data);

    const item = await prisma.maintenanceItem.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        image: validated.image || null,
        category: validated.category,
        cost: Number(validated.cost),
        expectedDate: validated.expectedDate
          ? new Date(validated.expectedDate)
          : null,
        completedDate: validated.completedDate
          ? new Date(validated.completedDate)
          : null,
        status: validated.status,
        notes: validated.notes || null,
      },
    });

    return {
      success: true,
      data: item,
    };
  } catch (error) {
    console.error("[createMaintenanceItem] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create maintenance item",
    };
  }
}


// =====================================
// UPDATE MAINTENANCE ITEM
// =====================================

export async function updateMaintenanceItem(
  id: string,
  data: MaintenanceItemFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = maintenanceItemSchema.parse(data);

    const item = await prisma.maintenanceItem.update({
      where: {
        id,
      },
      data: {
        name: validated.name,
        description: validated.description || null,
        image: validated.image || null,
        category: validated.category,
        cost: Number(validated.cost),
        expectedDate: validated.expectedDate
          ? new Date(validated.expectedDate)
          : null,
        completedDate: validated.completedDate
          ? new Date(validated.completedDate)
          : null,
        status: validated.status,
        notes: validated.notes || null,
      },
    });

    return {
      success: true,
      data: item,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: "Maintenance item not found",
        };
      }
    }

    console.error("[updateMaintenanceItem] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update maintenance item",
    };
  }
}
// =====================================
// GET MAINTENANCE TOTALS
// =====================================

export async function getMaintenanceTotals(): Promise<
  ActionResponse<{
    grandTotal: number;
    byCategory: {
      categoryName: string;
      total: number;
    }[];
    byStatus: {
      status: string;
      total: number;
      count: number;
    }[];
  }>
> {
  try {
    const categories = [
      "House Maintenance",
      "Household Maintenance",
      "Personal Maintenance",
    ];

    let grandTotal = 0;

    const byCategory = [];

    for (const category of categories) {
      const result = await prisma.maintenanceItem.aggregate({
        where: {
          category,
          isDeleted: false,
        },
        _sum: {
          cost: true,
        },
      });

      const total = Number(result._sum.cost || 0);

      grandTotal += total;

      byCategory.push({
        categoryName: category,
        total,
      });
    }


    const statuses = [
      "pending",
      "in-progress",
      "completed",
    ];

    const byStatus = [];

    for (const status of statuses) {
      const result = await prisma.maintenanceItem.aggregate({
        where: {
          status,
          isDeleted: false,
        },
        _sum: {
          cost: true,
        },
        _count: {
          _all: true,
        },
      });

      byStatus.push({
        status,
        total: Number(result._sum.cost || 0),
        count: result._count._all,
      });
    }


    return {
      success: true,
      data: {
        grandTotal,
        byCategory,
        byStatus,
      },
    };

  } catch (error) {
    console.error("[getMaintenanceTotals] Error:", error);

    return {
      success: false,
      error: "Failed to fetch maintenance totals",
    };
  }
}