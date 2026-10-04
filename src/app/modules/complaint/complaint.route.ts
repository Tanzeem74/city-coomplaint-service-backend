import { Router } from "express";
import { ComplaintController } from "./complaint.controller";
import { ComplaintValidation } from "./complaint.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  auth("CITIZEN"),
  validateRequest(ComplaintValidation.createComplaintSchema),
  ComplaintController.createComplaint,
);

router.get("/my", auth("CITIZEN"), ComplaintController.getMyComplaints);

router.get("/my/:id", auth("CITIZEN"), ComplaintController.getMyComplaintById);

export const ComplaintRoutes = router;
