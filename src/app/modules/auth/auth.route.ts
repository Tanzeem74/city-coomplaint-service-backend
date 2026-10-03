import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerUserSchema),
  AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginUserSchema),
  AuthController.loginUser,
);

router.get("/me", auth("CITIZEN", "STAFF", "ADMIN"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: req.user,
  });
});
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logoutUser);
router.post(
  "/google",
  validateRequest(AuthValidation.googleLoginSchema),
  AuthController.googleLogin,
);

export const AuthRoutes = router;
