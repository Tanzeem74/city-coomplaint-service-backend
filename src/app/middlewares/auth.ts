import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import config from "../config";
import prisma from "../lib/prisma";
import AppError from "../errors/AppError";
import type { UserRole } from "../../generated/prisma/client";

type JwtUserPayload = {
  id: string;
  email: string;
  role: UserRole;
};

const auth =
  (...requiredRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Authorization token is required",
        );
      }

      const [bearer, token] = authorization.split(" ");

      if (bearer !== "Bearer" || !token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization format",
        );
      }

      let decoded: JwtUserPayload;

      try {
        decoded = jwt.verify(token, config.jwt.accessSecret) as JwtUserPayload;
      } catch {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired access token",
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user || user.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User account not found");
      }

      if (user.status !== "ACTIVE") {
        throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to access this resource",
        );
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
