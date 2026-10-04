import { Router } from "express";
import { DepartmentController } from "./department.controller";
import { DepartmentValidation } from "./department.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(DepartmentValidation.createDepartmentSchema),
  DepartmentController.createDepartment,
);

router.get(
  "/",
  auth("CITIZEN", "STAFF", "ADMIN"),
  DepartmentController.getAllDepartments,
);

router.get(
  "/:id",
  auth("CITIZEN", "STAFF", "ADMIN"),
  DepartmentController.getDepartmentById,
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(DepartmentValidation.updateDepartmentSchema),
  DepartmentController.updateDepartment,
);

router.delete("/:id", auth("ADMIN"), DepartmentController.deleteDepartment);

export const DepartmentRoutes = router;
