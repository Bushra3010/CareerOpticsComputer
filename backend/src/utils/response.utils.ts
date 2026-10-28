import { Response } from "express";

export class ErrorResponse extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public statusText: string = "BAD_REQUEST",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const SuccessResponse = (
  res: Response,
  message: string,
  data: any = {},
  statusCode: number = 200,
  statusText: string = "OK",
) => {
  return res.status(statusCode).json({
    message,
    data,
    success: true,
  });
};

