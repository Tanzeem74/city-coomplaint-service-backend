import bcrypt from "bcrypt";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import config from "../../config";
import { generateToken } from "../../utils/jwt";
import AppError from "../../errors/AppError";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (payload: IRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcryptSaltRounds,
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user || !user.password) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const accessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn as SignOptions["expiresIn"],
  );

  const refreshToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  );

  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
