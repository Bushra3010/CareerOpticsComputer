import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client/client";
import { prisma } from "../../db";
import { config } from "../../config";
import { asyncHandler } from "../../utils/async.utils";
import { authenticate } from "../../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many sign-in attempts. Try again in 15 minutes." } });
const signAccess = (payload: object) => jwt.sign(payload, config.JWT_SECRET, { expiresIn: "15m" });
const signRefresh = (payload: object) => jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: "30d" });

router.post("/bootstrap", asyncHandler(async (req, res) => {
  if (!config.BOOTSTRAP_TOKEN || req.headers["x-bootstrap-token"] !== config.BOOTSTRAP_TOKEN) return res.status(403).json({ success: false, message: "Bootstrap is disabled" });
  if (await prisma.user.count()) return res.status(409).json({ success: false, message: "System has already been initialized" });
  const input = z.object({ organizationName: z.string().min(2), adminName: z.string().min(2), email: z.string().email(), phone: z.string().min(10), branchName: z.string().min(2), city: z.string().min(2), state: z.string().min(2), pincode: z.string().min(6) }).parse(req.body);
  const passwordHash = await bcrypt.hash("admin123", 12);
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const owner = await tx.user.create({ data: { userType: "ORGANIZATION", role: "ORGANIZATION_ADMIN", name: input.adminName, email: input.email, phone: input.phone, username: "admin", password: passwordHash } });
    const org = await tx.organization.create({ data: { userId: owner.id, name: input.organizationName, code: `ORG-${Date.now()}`, email: input.email, phone: input.phone, streetAddress: "To be updated", city: input.city, state: input.state, district: input.city, pincode: input.pincode } });
    const branchUser = await tx.user.create({ data: { userType: "BRANCH", role: "BRANCH_ADMIN", name: `${input.branchName} Admin`, email: `branch.${input.email}`, username: `branch.${input.email}`, password: passwordHash } });
    const branch = await tx.branch.create({ data: { organizationId: org.id, userId: branchUser.id, name: input.branchName, code: `BR-${Date.now()}`, academicYear: "2026-27", phone: input.phone, email: `branch.${input.email}` } });
    return { owner, org, branch };
  });
  res.status(201).json({ success: true, data: { organizationId: result.org.id, branchId: result.branch.id, adminEmail: input.email } });
}));

router.post("/login", loginLimiter, asyncHandler(async (req, res) => {
  const input = z.object({ identifier: z.string().min(3), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findFirst({ where: { OR: [{ email: input.identifier }, { username: input.identifier }], deletedAt: null }, include: { organization: { include: { branches: { where: { deletedAt: null }, take: 1 } } }, branch: true } });
  if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.password))) return res.status(401).json({ success: false, message: "Incorrect email/username or password" });
  const organizationId = user.organization?.id || user.branch?.organizationId;
  const branchId = user.branch?.id || user.organization?.branches[0]?.id;
  const payload = { userId: user.id, role: user.role, organizationId, branchId };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh({ userId: user.id, nonce: crypto.randomUUID() });
  await prisma.$transaction([
    prisma.refreshSession.create({ data: { userId: user.id, tokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"), expiresAt: new Date(Date.now() + 30 * 86400000), userAgent: req.get("user-agent"), ipAddress: req.ip } }),
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
  ]);
  res.json({ success: true, data: { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId, branchId } } });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const token = z.object({ refreshToken: z.string() }).parse(req.body).refreshToken;
  let decoded: { userId: string };
  try { decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { userId: string } } catch { return res.status(401).json({ success: false, message: "Refresh token invalid" }) }
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await prisma.refreshSession.findUnique({ where: { tokenHash: hash }, include: { user: { include: { organization: { include: { branches: { take: 1 } } }, branch: true } } } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || !session.user.isActive) return res.status(401).json({ success: false, message: "Session expired" });
  const u = session.user;
  const organizationId = u.organization?.id || u.branch?.organizationId;
  const branchId = u.branch?.id || u.organization?.branches[0]?.id;
  res.json({ success: true, data: { accessToken: signAccess({ userId: u.id, role: u.role, organizationId, branchId }) } });
}));

router.post("/logout", authenticate, asyncHandler(async (req, res) => {
  const token = req.body.refreshToken;
  if (token) await prisma.refreshSession.updateMany({ where: { tokenHash: crypto.createHash("sha256").update(token).digest("hex") }, data: { revokedAt: new Date() } });
  res.status(204).send();
}));
router.get("/me", authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { id: true, name: true, email: true, phone: true, role: true, userType: true, lastLoginAt: true } });
  res.json({ success: true, data: user });
}));
export default router;
