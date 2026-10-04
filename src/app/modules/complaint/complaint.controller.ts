import type { Request, Response } from "express";
import httpStatus from "http-status";
import { ComplaintService } from "./complaint.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";

const createComplaint = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
  }

  const result = await ComplaintService.createComplaint(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Complaint submitted successfully",
    data: result,
  });
});

const getMyComplaints = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
  }

  const result = await ComplaintService.getMyComplaints(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaints retrieved successfully",
    data: result,
  });
});

const getMyComplaintById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
  }

  const result = await ComplaintService.getMyComplaintById(
    req.params.id as string,
    req.user.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaint retrieved successfully",
    data: result,
  });
});
const getAllComplaints = catchAsync(async (req: Request, res: Response) => {
  const result = await ComplaintService.getAllComplaints(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaints retrieved successfully",
    data: result,
  });
});
const assignComplaint = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
  }

  const result = await ComplaintService.assignComplaint(
    req.params.id as string,
    req.user.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaint assigned successfully",
    data: result,
  });
});
const getMyAssignedComplaints = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
    }

    const result = await ComplaintService.getMyAssignedComplaints(req.user.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Assigned complaints retrieved successfully",
      data: result,
    });
  },
);

const updateComplaintStatus = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
    }

    const result = await ComplaintService.updateComplaintStatus(
      req.params.id as string,
      req.user.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Complaint status updated successfully",
      data: result,
    });
  },
);
export const ComplaintController = {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
  getAllComplaints,
  assignComplaint,
  updateComplaintStatus,
  getMyAssignedComplaints,
};
