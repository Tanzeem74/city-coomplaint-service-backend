import { z } from "zod";

const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Department name must be at least 2 characters"),

    description: z.string().optional(),
  }),
});

const updateDepartmentSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Department name must be at least 2 characters")
      .optional(),

    description: z.string().optional(),

    isActive: z.boolean().optional(),
  }),
});

export const DepartmentValidation = {
  createDepartmentSchema,
  updateDepartmentSchema,
};
