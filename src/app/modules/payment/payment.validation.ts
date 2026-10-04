import { z } from "zod";

const createPaymentSchema = z.object({
  body: z.object({
    complaintId: z.string().min(1, "Complaint ID is required"),
  }),
});

export const PaymentValidation = {
  createPaymentSchema,
};
