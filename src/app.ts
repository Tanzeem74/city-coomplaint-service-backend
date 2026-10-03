import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { AuthRoutes } from "./app/modules/auth/auth.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "City Complaint Service API is running",
  });
});

app.use("/api/v1/auth", AuthRoutes);

export default app;
