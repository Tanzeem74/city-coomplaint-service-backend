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
import { DepartmentRoutes } from "./app/modules/department/department.route";
import { CategoryRoutes } from "./app/modules/category/category.route";
import { ComplaintRoutes } from "./app/modules/complaint/complaint.route";

const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "City Complaint Service API is running",
  });
});

// Application routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/departments", DepartmentRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/complaints", ComplaintRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
