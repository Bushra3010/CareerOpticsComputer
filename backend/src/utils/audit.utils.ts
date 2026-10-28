import type { Request } from "express";
import { prisma } from "../db";
export const audit = (req: Request, action: string, entityType: string, entityId?: string, after?: object) => prisma.auditEvent.create({ data: { actorId:req.auth?.userId, organizationId:req.auth?.organizationId, branchId:req.auth?.branchId, action, entityType, entityId, after, ipAddress:req.ip } });
