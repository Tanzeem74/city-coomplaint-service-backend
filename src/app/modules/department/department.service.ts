import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import type {
  ICreateDepartment,
  IUpdateDepartment,
} from "./department.interface";

const createDepartment = async (payload: ICreateDepartment) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (existingDepartment) {
    throw new AppError(httpStatus.CONFLICT, "Department already exists");
  }

  return prisma.department.create({
    data: payload,
  });
};

const getAllDepartments = async () => {
  return prisma.department.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getDepartmentById = async (id: string) => {
  const department = await prisma.department.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Department not found");
  }

  return department;
};

const updateDepartment = async (id: string, payload: IUpdateDepartment) => {
  const department = await prisma.department.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Department not found");
  }

  if (payload.name && payload.name !== department.name) {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingDepartment) {
      throw new AppError(httpStatus.CONFLICT, "Department already exists");
    }
  }

  return prisma.department.update({
    where: {
      id,
    },
    data: payload,
  });
};

const deleteDepartment = async (id: string) => {
  const department = await prisma.department.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });
};

export const DepartmentService = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
