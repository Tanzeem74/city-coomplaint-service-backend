import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerUser(req.body);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginUser(req.body);

    res.status(httpStatus.OK).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

export const AuthController = {
  registerUser,
  loginUser,
};
