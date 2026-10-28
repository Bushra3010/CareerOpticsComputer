import app from "./app";
import { config } from "./config";
import { prisma } from "./db";

const server = app.listen(config.PORT, () => {
  console.log(`Career Optics Computer Centre ERP API listening on port ${config.PORT}`);
});

const shutdown = async () => { server.close(async () => { await prisma.$disconnect(); process.exit(0); }); };
process.on("SIGTERM", shutdown); process.on("SIGINT", shutdown);
