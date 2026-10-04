import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/me",
  auth("CITIZEN", "STAFF", "ADMIN"),
  UserController.getMyProfile,
);

router.patch(
  "/me",
  auth("CITIZEN", "STAFF", "ADMIN"),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateMyProfile,
);

router.get("/", auth("ADMIN"), UserController.getAllUsers);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(UserValidation.updateUserSchema),
  UserController.updateUser,
);

router.delete("/:id", auth("ADMIN"), UserController.deleteUser);

export const UserRoutes = router;
