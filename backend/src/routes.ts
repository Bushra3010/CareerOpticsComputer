import { Router } from "express";
import authRoutes from "./module/auth/auth.routes";
import coreRoutes from "./module/core/core.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/core", coreRoutes);

export default router;
