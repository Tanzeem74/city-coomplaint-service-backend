import { z } from "zod";

const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(["CITIZEN", "STAFF", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    profilePhoto: z.string().optional(),
  }),
});

export const UserValidation = {
  updateUserSchema,
  updateProfileSchema,
};
