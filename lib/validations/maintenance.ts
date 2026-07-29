import { z } from "zod";

export const maintenanceCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type MaintenanceCategoryFormData = z.infer<typeof maintenanceCategorySchema>;

export const maintenanceItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(200, "Item name must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .optional()
    .or(z.literal("")),
  category: z
  .enum([
    "House Maintenance",
    "Household Maintenance",
    "Personal Maintenance",
  ], {
    message: "Category is required",
  }),
  cost: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Cost must be a positive number",
    }),
  expectedDate: z
    .string()
    .optional()
    .or(z.literal("")),
  completedDate: z
    .string()
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["pending", "in-progress", "completed"])
    .default("pending"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type MaintenanceItemFormData = z.infer<typeof maintenanceItemSchema>;
