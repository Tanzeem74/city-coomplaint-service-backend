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
router.get(
  "/manage/all",
  auth("ADMIN", "STAFF"),
  ComplaintController.getAllComplaints,
);
router.get("/my", auth("CITIZEN"), ComplaintController.getMyComplaints);

router.get("/my/:id", auth("CITIZEN"), ComplaintController.getMyComplaintById);

router.patch(
  "/:id/assign",
  auth("ADMIN"),
  validateRequest(ComplaintValidation.assignComplaintSchema),
  ComplaintController.assignComplaint,
);
router.get(
  "/staff/assigned",
  auth("STAFF"),
  ComplaintController.getMyAssignedComplaints,
);

router.patch(
  "/:id/status",
  auth("STAFF"),
  validateRequest(ComplaintValidation.updateComplaintStatusSchema),
  ComplaintController.updateComplaintStatus,
);
export const ComplaintRoutes = router;
