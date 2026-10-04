import { z } from "zod";

const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),

    location: z.string().min(3, "Location is required"),

    departmentId: z.string().min(1, "Department ID is required"),

    categoryId: z.string().min(1, "Category ID is required"),
  }),
});

export const ComplaintValidation = {
  createComplaintSchema,
};
