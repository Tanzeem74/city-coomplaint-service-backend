import { Router } from "express";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory,
);

router.get(
  "/",
  auth("CITIZEN", "STAFF", "ADMIN"),
  CategoryController.getAllCategories,
);

router.get(
  "/:id",
  auth("CITIZEN", "STAFF", "ADMIN"),
  CategoryController.getCategoryById,
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory,
);

router.delete("/:id", auth("ADMIN"), CategoryController.deleteCategory);

export const CategoryRoutes = router;
