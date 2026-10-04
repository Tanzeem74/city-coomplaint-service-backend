import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import type { ICreateCategory, IUpdateCategory } from "./category.interface";

const checkDepartment = async (departmentId: string) => {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      isDeleted: false,
      isActive: true,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Active department not found");
  }

  return department;
};

const createCategory = async (payload: ICreateCategory) => {
  await checkDepartment(payload.departmentId);

  const existingCategory = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (existingCategory) {
    throw new AppError(httpStatus.CONFLICT, "Category already exists");
  }

  return prisma.category.create({
    data: payload,
    include: {
      department: true,
    },
  });
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      department: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      department: true,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const updateCategory = async (id: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (payload.departmentId) {
    await checkDepartment(payload.departmentId);
  }

  if (payload.name && payload.name !== category.name) {
    const existingCategory = await prisma.category.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingCategory) {
      throw new AppError(httpStatus.CONFLICT, "Category already exists");
    }
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: payload,
    include: {
      department: true,
    },
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
