import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
  try { req.auth = jwt.verify(token, config.JWT_SECRET) as Request["auth"]; return next(); }
  catch { return res.status(401).json({ success: false, message: "Session expired or invalid" }); }
}

export const permit = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) return res.status(403).json({ success: false, message: "You do not have permission for this action" });
  next();
};
