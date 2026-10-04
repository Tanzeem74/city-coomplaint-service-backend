import { z } from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),

    description: z.string().optional(),

    departmentId: z.string().min(1, "Department ID is required"),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .optional(),

    description: z.string().optional(),

    departmentId: z.string().min(1).optional(),

    isActive: z.boolean().optional(),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
