import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { ZodError } from "zod";

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";

  let errorDetails = error;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";

    errorDetails = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

export default globalErrorHandler;
