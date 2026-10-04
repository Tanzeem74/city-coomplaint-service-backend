import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  auth("CITIZEN"),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.createPayment,
);

router.get("/verify", auth("CITIZEN"), PaymentController.verifyPayment);

router.get("/my", auth("CITIZEN"), PaymentController.getMyPayments);

router.patch("/:id/cancel", auth("CITIZEN"), PaymentController.cancelPayment);

router.get("/admin/all", auth("ADMIN"), PaymentController.getAllPayments);

export const PaymentRoutes = router;
