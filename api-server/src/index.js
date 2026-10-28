require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.set("trust proxy", true);
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

const authRoutes = require("./routes/auth.js");
const coreRoutes = require("./routes/core.js");
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/core", coreRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log("API running on :" + PORT));
