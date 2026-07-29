import { z } from "zod";

export const expenseSchema = z.object({
  name: z
    .string()
    .min(1, "Expense name is required")
    .max(200, "Expense name must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .optional()
    .or(z.literal("")),
  categoryId: z
    .string()
    .min(1, "Category is required"),
  amount: z.coerce
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be a positive number"),
  duration: z
    .string()
    .optional()
    .or(z.literal("")),
  paidOn: z
    .string()
    .optional()
    .or(z.literal("")),
  instructions: z
    .string()
    .max(500, "Instructions must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  accountNumber: z
    .string()
    .max(100, "Account number must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  calculations: z
    .string()
    .max(1000, "Calculations must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
