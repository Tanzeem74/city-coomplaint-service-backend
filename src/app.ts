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

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
