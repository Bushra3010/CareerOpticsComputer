import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  BOOTSTRAP_TOKEN: z.string().min(16).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment: ${parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")}`);
export const config = { ...parsed.data, corsOrigins: parsed.data.CORS_ORIGINS.split(",").map(value => value.trim()) };
