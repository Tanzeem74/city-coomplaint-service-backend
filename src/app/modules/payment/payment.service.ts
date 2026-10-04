import Stripe from "stripe";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import config from "../../config";
import AppError from "../../errors/AppError";
import { createAuditLog } from "../../utils/auditLog";
import type { ICreatePayment } from "./payment.interface";

if (!config.stripe.secretKey) {
  console.warn("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(config.stripe.secretKey);

const SERVICE_FEE = 5;

const createPayment = async (userId: string, payload: ICreatePayment) => {
  if (!config.stripe.secretKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stripe is not configured",
    );
  }

  const complaint = await prisma.complaint.findFirst({
    where: {
      id: payload.complaintId,
      citizenId: userId,
      isDeleted: false,
    },
  });

  if (!complaint) {
    throw new AppError(httpStatus.NOT_FOUND, "Complaint not found");
  }

  const existingPaidPayment = await prisma.payment.findFirst({
    where: {
      complaintId: complaint.id,
      userId,
      status: "PAID",
    },
  });

  if (existingPaidPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment has already been completed",
    );
  }

  const payment = await prisma.payment.create({
    data: {
      amount: SERVICE_FEE,
      currency: "usd",
      userId,
      complaintId: complaint.id,
    },
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: "City Service Request Fee",

              // Stripe Checkout page-এ দেখা যাবে
              description:
                `Complaint: ${complaint.title} | ` +
                `Complaint ID: ${complaint.id}`,
            },

            unit_amount: SERVICE_FEE * 100,
          },

          quantity: 1,
        },
      ],

      success_url:
        `${config.stripe.successUrl}` + `?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${config.stripe.cancelUrl}` + `?paymentId=${payment.id}`,

      // Stripe Dashboard-এ reference হিসেবে থাকবে
      metadata: {
        paymentId: payment.id,
        complaintId: complaint.id,
        userId,
      },

      payment_intent_data: {
        metadata: {
          paymentId: payment.id,
          complaintId: complaint.id,
          userId,
        },
      },
    });

    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        stripeSessionId: session.id,
      },
    });

    await createAuditLog({
      userId,
      action: "CREATE_PAYMENT",
      entityType: "PAYMENT",
      entityId: payment.id,
      details: `Stripe checkout created for complaint ${complaint.id}`,
    });

    return {
      paymentId: payment.id,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      amount: SERVICE_FEE,
      currency: "usd",
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  } catch (error) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};

const verifyPayment = async (sessionId: string, userId: string) => {
  if (!config.stripe.secretKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stripe is not configured",
    );
  }

  const payment = await prisma.payment.findFirst({
    where: {
      stripeSessionId: sessionId,
      userId,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return {
      paid: false,
      status: session.payment_status,
      payment,
    };
  }

  const updatedPayment = await prisma.payment.update({
    where: {
      id: payment.id,
    },

    data: {
      status: "PAID",

      stripePaymentIntId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    },
  });

  if (payment.status !== "PAID") {
    await createAuditLog({
      userId,
      action: "PAYMENT_SUCCESS",
      entityType: "PAYMENT",
      entityId: payment.id,
      details: `Payment completed for complaint ` + `${payment.complaintId}`,
    });
  }

  return {
    paid: true,
    status: "PAID",
    payment: updatedPayment,
  };
};

const cancelPayment = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.status === "PAID") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Paid payment cannot be cancelled",
    );
  }

  const updatedPayment = await prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "CANCELLED",
    },
  });

  await createAuditLog({
    userId,
    action: "PAYMENT_CANCELLED",
    entityType: "PAYMENT",
    entityId: payment.id,
    details: `Payment cancelled for complaint ` + `${payment.complaintId}`,
  });

  return updatedPayment;
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: {
      userId,
    },

    include: {
      complaint: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllPayments = async () => {
  return prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      complaint: {
        select: {
          id: true,
          title: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const PaymentService = {
  createPayment,
  verifyPayment,
  cancelPayment,
  getMyPayments,
  getAllPayments,
};
