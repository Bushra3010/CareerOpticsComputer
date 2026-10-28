import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import router from "./routes";
import { config } from "./config";
import { prisma } from "./db";

const app = express();

// Custom logger middleware (analogous to @grotto/logysia)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[Request] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Parsers
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      // Omit the Access-Control-Allow-Origin header instead of throwing, so the
      // browser blocks the request cleanly rather than the server returning 500.
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { message: "Too many requests", success: false },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Root route
app.get("/health/live", (_req, res) => res.json({ status: "ok", service: "careeroptics-erp-api" }));
app.get("/health/ready", async (_req, res) => { try { await prisma.$queryRaw`SELECT 1`; res.json({ status: "ready" }); } catch { res.status(503).json({ status: "not-ready" }); } });

// API Routes (prefix: "/api/v1")
app.use("/api/v1", router);

// Error handler middleware (must be registered last)
app.use(errorHandler);

export default app;
