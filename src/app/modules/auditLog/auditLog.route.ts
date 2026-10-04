import { Router } from "express";
import auth from "../../middlewares/auth";
import { AuditLogController } from "./auditLog.controller";

const router = Router();

router.get("/", auth("ADMIN"), AuditLogController.getAuditLogs);

export const AuditLogRoutes = router;
