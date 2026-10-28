import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return res.status(422).json({ success: false, message: "Please correct the highlighted fields", errors: result.error.flatten() });
  Object.assign(req, result.data); next();
};
