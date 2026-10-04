import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";

const getAllUsers = async (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const where: any = {
    isDeleted: false,
  };

  if (query.role) {
    where.role = String(query.role);
  }

  if (query.status) {
    where.status = String(query.status);
  }

  if (query.searchTerm) {
    const searchTerm = String(query.searchTerm);

    where.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.count({
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

const updateUser = async (
  id: string,
  payload: {
    role?: "CITIZEN" | "STAFF" | "ADMIN";
    status?: "ACTIVE" | "BLOCKED";
  },
) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

const getMyProfile = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePhoto: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateMyProfile = async (
  id: string,
  payload: {
    name?: string;
    phone?: string;
    profilePhoto?: string;
  },
) => {
  return prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePhoto: true,
      role: true,
    },
  });
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      status: "DELETED",
    },
  });
};

export const UserService = {
  getAllUsers,
  updateUser,
  getMyProfile,
  updateMyProfile,
  deleteUser,
};
