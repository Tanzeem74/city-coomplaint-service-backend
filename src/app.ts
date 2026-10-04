import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { DepartmentRoutes } from "./app/modules/department/department.route";
import { CategoryRoutes } from "./app/modules/category/category.route";
import { ComplaintRoutes } from "./app/modules/complaint/complaint.route";
import { DashboardRoutes } from "./app/modules/dashboard/dashboard.route";
import { UserRoutes } from "./app/modules/user/user.route";
import { PaymentRoutes } from "./app/modules/payment/payment.route";
import { AuditLogRoutes } from "./app/modules/auditLog/auditLog.route";

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "City Complaint Service API is running",
  });
});

// Application routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/departments", DepartmentRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/complaints", ComplaintRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/audit-logs", AuditLogRoutes);
// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
