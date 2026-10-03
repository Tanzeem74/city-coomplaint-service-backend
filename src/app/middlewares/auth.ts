import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import prisma from "../lib/prisma";
import type { UserRole } from "../../generated/prisma/client";

export interface AuthUser extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

const auth =
  (...requiredRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw new Error("Authorization token is required");
      }

      const [bearer, token] = authorization.split(" ");

      if (bearer !== "Bearer" || !token) {
        throw new Error("Invalid authorization format");
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret) as AuthUser;

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.isDeleted) {
        throw new Error("User account is deleted");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("User account is not active");
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new Error("You are not authorized to access this resource");
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
