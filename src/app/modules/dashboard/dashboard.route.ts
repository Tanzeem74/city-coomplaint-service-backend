import { Router } from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";

const router = Router();

router.get("/admin", auth("ADMIN"), DashboardController.getAdminDashboard);

export const DashboardRoutes = router;
