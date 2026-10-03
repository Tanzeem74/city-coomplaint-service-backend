import bcrypt from "bcrypt";
import prisma from "../../lib/prisma.js";
import config from "../../config/index.js";
import { generateToken } from "../../utils/jwt.js";
import { SignOptions } from "jsonwebtoken";
import { ILoginUser, IRegisterUser } from "./auth.interfeace";

const registerUser = async (payload: IRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
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
    throw new Error("Invalid email or password");
  }

  if (user.isDeleted) {
    throw new Error("User account is deleted");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User account is not active");
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new Error("Invalid email or password");
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
