import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client/client";
import { config } from "./config";

const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalDb.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: config.DATABASE_URL }) });
if (config.NODE_ENV !== "production") globalDb.prisma = prisma;
