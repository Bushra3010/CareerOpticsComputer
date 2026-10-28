import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../utils/response.utils";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err?.name === "ZodError") return res.status(422).json({ success: false, message: "Validation failed", errors: err.flatten?.() });
  if (err?.code === "P2002") return res.status(409).json({ success: false, message: "A record with this value already exists", fields: err.meta?.target });
  if (err?.code === "P2025") return res.status(404).json({ success: false, message: "Record not found" });
  // If headers have already been sent to the client, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const code = err.code || (err instanceof ErrorResponse ? "ERROR_RESPONSE" : "UNKNOWN");

  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.statusText || "Unknown Error",
      success: false,
    });
  }

  if (code === "INTERNAL_SERVER_ERROR") {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      success: false,
    });
  }
  if (code === "NOT_FOUND") {
    return res.status(404).json({
      message: "Not Found",
      error: err.message,
      success: false,
    });
  }
  if (code === "VALIDATION") {
    const errors: any = {};
    if (err.all && Array.isArray(err.all)) {
      err.all.forEach((e: any) => {
        const path = e.path ? e.path.replace("/", "") : "";
        if (path) {
          errors[path] = e.summary || e.message;
        }
      });
    }

    return res.status(400).json({
      message: (err.all && err.all[0] && err.all[0].message) || err.message || "Validation Error",
      error: errors,
      success: false,
    });
  }
  if (code === "PARSE") {
    return res.status(400).json({
      message: "Parse Error",
      error: err.message,
      success: false,
    });
  }
  if (code === "INVALID_COOKIE_SIGNATURE") {
    return res.status(400).json({
      message: "Invalid Cookie Signature",
      error: err.message,
      success: false,
    });
  }
  if (code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      message: "Invalid File Type",
      error: err.statusText || "Invalid File Type",
      success: false,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    message: err.message || "Something went wrong",
    error: err.statusText || "INTERNAL_SERVER_ERROR",
    success: false,
  });
};
