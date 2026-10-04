import type { Request, Response } from "express";
import httpStatus from "http-status";
import { DepartmentService } from "./department.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentService.createDepartment(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Department created successfully",
    data: result,
  });
});

const getAllDepartments = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentService.getAllDepartments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Departments retrieved successfully",
    data: result,
  });
});

const getDepartmentById = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentService.getDepartmentById(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Department retrieved successfully",
    data: result,
  });
});

const updateDepartment = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentService.updateDepartment(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Department updated successfully",
    data: result,
  });
});

const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentService.deleteDepartment(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Department deleted successfully",
    data: result,
  });
});

export const DepartmentController = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
