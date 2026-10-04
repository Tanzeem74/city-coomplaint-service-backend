import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import type {
  IAssignComplaint,
  IComplaintQuery,
  ICreateComplaint,
  IUpdateComplaintStatus,
} from "./complaint.interface";

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

const getAllComplaints = async (query: IComplaintQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const allowedSortFields = ["createdAt", "updatedAt", "priority", "status"];

  const sortBy = allowedSortFields.includes(query.sortBy || "")
    ? query.sortBy!
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where: any = {
    isDeleted: false,
  };

  if (query.searchTerm) {
    where.OR = [
      {
        title: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  const [data, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          where: {
            endedAt: null,
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
      },
    }),

    prisma.complaint.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const assignComplaint = async (
  complaintId: string,
  adminId: string,
  payload: IAssignComplaint,
) => {
  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      isDeleted: false,
    },
  });

  if (!complaint) {
    throw new AppError(httpStatus.NOT_FOUND, "Complaint not found");
  }

  if (
    complaint.status === "RESOLVED" ||
    complaint.status === "CLOSED" ||
    complaint.status === "REJECTED" ||
    complaint.status === "CANCELLED"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot assign a ${complaint.status.toLowerCase()} complaint`,
    );
  }

  const staff = await prisma.user.findFirst({
    where: {
      id: payload.staffId,
      role: "STAFF",
      status: "ACTIVE",
      isDeleted: false,
    },
  });

  if (!staff) {
    throw new AppError(httpStatus.NOT_FOUND, "Active staff member not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.complaintAssignment.updateMany({
      where: {
        complaintId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });

    const assignment = await tx.complaintAssignment.create({
      data: {
        complaintId,
        staffId: payload.staffId,
        assignedById: adminId,
        note: payload.note,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: "ASSIGNED",
      },
    });

    await tx.complaintUpdate.create({
      data: {
        complaintId,
        updatedById: adminId,
        status: "ASSIGNED",
        message: `Complaint assigned to ${staff.name}`,
      },
    });

    return assignment;
  });

  return result;
};

const getMyAssignedComplaints = async (staffId: string) => {
  return prisma.complaint.findMany({
    where: {
      isDeleted: false,
      assignments: {
        some: {
          staffId,
          endedAt: null,
        },
      },
    },
    include: {
      citizen: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      department: true,
      category: true,
      assignments: {
        where: {
          staffId,
          endedAt: null,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateComplaintStatus = async (
  complaintId: string,
  staffId: string,
  payload: IUpdateComplaintStatus,
) => {
  const assignment = await prisma.complaintAssignment.findFirst({
    where: {
      complaintId,
      staffId,
      endedAt: null,
    },
    include: {
      complaint: true,
    },
  });

  if (!assignment || assignment.complaint.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This complaint is not assigned to you",
    );
  }

  const currentStatus = assignment.complaint.status;

  if (
    currentStatus === "RESOLVED" ||
    currentStatus === "CLOSED" ||
    currentStatus === "REJECTED" ||
    currentStatus === "CANCELLED"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot update a ${currentStatus.toLowerCase()} complaint`,
    );
  }

  if (payload.status === "RESOLVED" && currentStatus !== "IN_PROGRESS") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Complaint must be IN_PROGRESS before it can be resolved",
    );
  }

  if (payload.status === "IN_PROGRESS" && currentStatus !== "ASSIGNED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only an ASSIGNED complaint can be moved to IN_PROGRESS",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: payload.status,

        ...(payload.status === "RESOLVED" && {
          resolvedAt: new Date(),
        }),
      },
      include: {
        department: true,
        category: true,
      },
    });

    await tx.complaintUpdate.create({
      data: {
        complaintId,
        updatedById: staffId,
        status: payload.status,
        message:
          payload.message || `Complaint status updated to ${payload.status}`,
      },
    });

    return complaint;
  });

  return result;
};

export const ComplaintService = {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
  getAllComplaints,
  assignComplaint,
  updateComplaintStatus,
  getMyAssignedComplaints,
};
