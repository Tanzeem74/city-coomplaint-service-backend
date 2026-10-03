import bcrypt from "bcrypt";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import config from "../../config";
const googleClient = new OAuth2Client(config.google.clientId);
import { generateToken } from "../../utils/jwt";
import AppError from "../../errors/AppError";
import { IGoogleLogin, ILoginUser, IRegisterUser } from "./auth.interface";
import jwt, { type SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

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

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }
  let decoded;

  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret) as {
      id: string;
      email: string;
      role: "CITIZEN" | "STAFF" | "ADMIN";
    };
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isDeleted || user.status !== "ACTIVE") {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
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

  return {
    accessToken,
  };
};

const googleLogin = async (payload: IGoogleLogin) => {
  if (!config.google.clientId) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Google authentication is not configured",
    );
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google.clientId,
    });
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google ID token");
  }

  const googlePayload = ticket.getPayload();

  if (!googlePayload || !googlePayload.email || !googlePayload.email_verified) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google account email is not verified",
    );
  }

  let user = await prisma.user.findUnique({
    where: {
      email: googlePayload.email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googlePayload.name || "Google User",
        email: googlePayload.email,
        profilePhoto: googlePayload.picture,
        isVerified: true,
      },
    });
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
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
      profilePhoto: user.profilePhoto,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  googleLogin,
};
