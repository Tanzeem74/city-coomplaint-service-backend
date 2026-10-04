import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import type { ICreateComplaint } from "./complaint.interface";

const createComplaint = async (
  citizenId: string,
  payload: ICreateComplaint,
) => {
  const department = await prisma.department.findFirst({
    where: {
      id: payload.departmentId,
      isDeleted: false,
      isActive: true,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Active department not found");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: payload.categoryId,
      departmentId: payload.departmentId,
      isDeleted: false,
      isActive: true,
    },
  });

  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Category does not belong to the selected department",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.create({
      data: {
        title: payload.title,
        description: payload.description,
        location: payload.location,
        departmentId: payload.departmentId,
        categoryId: payload.categoryId,
        citizenId,
      },
      include: {
        department: true,
        category: true,
      },
    });

    await tx.complaintUpdate.create({
      data: {
        complaintId: complaint.id,
        updatedById: citizenId,
        status: "SUBMITTED",
        message: "Complaint submitted",
      },
    });

    return complaint;
  });

  return result;
};

const getMyComplaints = async (citizenId: string) => {
  return prisma.complaint.findMany({
    where: {
      citizenId,
      isDeleted: false,
    },
    include: {
      department: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMyComplaintById = async (complaintId: string, citizenId: string) => {
  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      citizenId,
      isDeleted: false,
    },
    include: {
      department: true,
      category: true,

      updates: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },

      assignments: {
        orderBy: {
          assignedAt: "desc",
        },
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      attachments: true,
    },
  });

  if (!complaint) {
    throw new AppError(httpStatus.NOT_FOUND, "Complaint not found");
  }

  return complaint;
};

export const ComplaintService = {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
};
