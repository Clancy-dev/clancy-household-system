"use server";

import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryFormData } from "@/lib/validations/categories";
import { Prisma } from "../generated/prisma/client";


type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// GET ALL CATEGORIES (non-deleted)
export async function getCategories(): Promise<ActionResponse<any[]>> {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { expenses: { where: { isDeleted: false } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categoriesWithTotals = await Promise.all(
      categories.map(async (cat) => {
        const total = await prisma.expense.aggregate({
          where: { categoryId: cat.id, isDeleted: false },
          _sum: { amount: true },
        });
        return {
          ...cat,
          total: total._sum.amount || 0,
        };
      })
    );

    return {
      success: true,
      data: categoriesWithTotals,
    };
  } catch (error) {
    console.error("[getCategories] Error:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

// GET DELETED CATEGORIES (TRASH)
export async function getDeletedCategories(): Promise<ActionResponse<any[]>> {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: true },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: { deletedAt: "desc" },
    });

    return {
      success: true,
      data: categories,
    };

  } catch (error) {
    console.error("[getDeletedCategories] Error:", error);

    return {
      success: false,
      error: "Failed to fetch deleted categories",
    };
  }
}

// GET SINGLE CATEGORY
export async function getCategory(id: string): Promise<ActionResponse<any>> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: { where: { isDeleted: false } } },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const total = await prisma.expense.aggregate({
      where: { categoryId: id, isDeleted: false },
      _sum: { amount: true },
    });

    return {
      success: true,
      data: {
        ...category,
        total: total._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("[getCategory] Error:", error);
    return {
      success: false,
      error: "Failed to fetch category",
    };
  }
}

// CREATE CATEGORY
export async function createCategory(
  data: CategoryFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = categorySchema.parse(data);

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
        icon: validated.icon || null,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Category name already exists",
        };
      }
    }
    console.error("[createCategory] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

// UPDATE CATEGORY
export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = categorySchema.parse(data);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
        icon: validated.icon || null,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Category name already exists",
        };
      }
      if (error.code === "P2025") {
        return {
          success: false,
          error: "Category not found",
        };
      }
    }
    console.error("[updateCategory] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

// SOFT DELETE CATEGORY
export async function deleteCategory(id: string): Promise<ActionResponse<null>> {
  try {
    await prisma.category.update({
      where: { id },
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
    console.error("[deleteCategory] Error:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

// RESTORE DELETED CATEGORY
export async function restoreCategory(id: string): Promise<ActionResponse<any>> {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("[restoreCategory] Error:", error);
    return {
      success: false,
      error: "Failed to restore category",
    };
  }
}

// PERMANENTLY DELETE CATEGORY
export async function permanentlyDeleteCategory(id: string): Promise<ActionResponse<null>> {
  try {
    // Also delete all associated expenses
    await prisma.expense.deleteMany({
      where: { categoryId: id },
    });

    await prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("[permanentlyDeleteCategory] Error:", error);
    return {
      success: false,
      error: "Failed to permanently delete category",
    };
  }
}
