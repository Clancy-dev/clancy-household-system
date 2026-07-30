"use server";

import { prisma } from "@/lib/prisma";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/expenses";
import { Prisma } from "../generated/prisma/client";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// GET ALL EXPENSES (non-deleted)
export async function getExpenses(): Promise<ActionResponse<any[]>> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { isDeleted: false, 
                 category: {
                     isDeleted: false,
         }, },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: expenses,
    };
  } catch (error) {
    console.error("[getExpenses] Error:", error);
    return {
      success: false,
      error: "Failed to fetch expenses",
    };
  }
}

// GET DELETED EXPENSES (TRASH)
export async function getDeletedExpenses(): Promise<ActionResponse<any[]>> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { isDeleted: true },
      include: {
        category: true,
      },
      orderBy: { deletedAt: "desc" },
    });

    return {
      success: true,
      data: expenses,
    };
  } catch (error) {
    console.error("[getDeletedExpenses] Error:", error);

    return {
      success: false,
      error: "Failed to fetch deleted expenses",
    };
  }
}

// GET EXPENSES BY CATEGORY
export async function getExpensesByCategory(categoryId: string): Promise<ActionResponse<any[]>> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { categoryId, isDeleted: false },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: expenses,
    };
  } catch (error) {
    console.error("[getExpensesByCategory] Error:", error);
    return {
      success: false,
      error: "Failed to fetch expenses",
    };
  }
}

// GET SINGLE EXPENSE
export async function getExpense(id: string): Promise<ActionResponse<any>> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!expense) {
      return {
        success: false,
        error: "Expense not found",
      };
    }

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error("[getExpense] Error:", error);
    return {
      success: false,
      error: "Failed to fetch expense",
    };
  }
}

// CREATE EXPENSE
export async function createExpense(
  data: ExpenseFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = expenseSchema.parse(data);

    const expense = await prisma.expense.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        image: validated.image || null,
        categoryId: validated.categoryId,
        amount: Number(validated.amount),
        duration: validated.duration || null,
        paidOn: validated.paidOn || null,
        instructions: validated.instructions || null,
        accountNumber: validated.accountNumber || null,
        calculations: validated.calculations || null,
      },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error("[createExpense] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

// UPDATE EXPENSE
export async function updateExpense(
  id: string,
  data: ExpenseFormData
): Promise<ActionResponse<any>> {
  try {
    const validated = expenseSchema.parse(data);

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description || null,
        image: validated.image || null,
        categoryId: validated.categoryId,
        amount: Number(validated.amount),
        duration: validated.duration || null,
        paidOn: validated.paidOn || null,
        instructions: validated.instructions || null,
        accountNumber: validated.accountNumber || null,
        calculations: validated.calculations || null,
      },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: "Expense not found",
        };
      }
    }
    console.error("[updateExpense] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

// SOFT DELETE EXPENSE
export async function deleteExpense(id: string): Promise<ActionResponse<null>> {
  try {
    await prisma.expense.update({
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
    console.error("[deleteExpense] Error:", error);
    return {
      success: false,
      error: "Failed to delete expense",
    };
  }
}

// RESTORE DELETED EXPENSE
export async function restoreExpense(id: string): Promise<ActionResponse<any>> {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error("[restoreExpense] Error:", error);
    return {
      success: false,
      error: "Failed to restore expense",
    };
  }
}

// PERMANENTLY DELETE EXPENSE
export async function permanentlyDeleteExpense(id: string): Promise<ActionResponse<null>> {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("[permanentlyDeleteExpense] Error:", error);
    return {
      success: false,
      error: "Failed to permanently delete expense",
    };
  }
}

// GET EXPENSE TOTALS
export async function getExpenseTotals(): Promise<ActionResponse<{
  grandTotal: number;
  byCategory: { categoryId: string; categoryName: string; total: number }[];
}>> {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { expenses: { where: { isDeleted: false } } },
        },
      },
    });

    let grandTotal = 0;
    const byCategory: any[] = [];

    for (const category of categories) {
      const total = await prisma.expense.aggregate({
        where: { categoryId: category.id, isDeleted: false },
        _sum: { amount: true },
      });

      const categoryTotal = total._sum.amount || 0;
      grandTotal += categoryTotal;

      byCategory.push({
        categoryId: category.id,
        categoryName: category.name,
        total: categoryTotal,
      });
    }

    return {
      success: true,
      data: {
        grandTotal,
        byCategory,
      },
    };
  } catch (error) {
    console.error("[getExpenseTotals] Error:", error);
    return {
      success: false,
      error: "Failed to fetch expense totals",
    };
  }
}
