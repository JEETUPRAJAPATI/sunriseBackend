import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";
import createSeedUsers from "./seed/seedUsers.js";
import { seedInventoryData } from "./seed/seedInventory.js";

const app = express();
const server = createServer(app);

// CORS setup
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://sunrisebackend-xfci.onrender.com",
  "https://sunrize.techizebuilder.com/"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Logging for API routes
app.use((req, res, next) => {
  const start = Date.now();
  let capturedResponse;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedResponse = body;
    return originalJson.call(this, body, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedResponse) logLine += ` :: ${JSON.stringify(capturedResponse)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect DB and seed
    await connectDB();
    // Create seed users after database connection
    await createSeedUsers();

    // Seed inventory data
    await seedInventoryData();
    // Register routes
    const authRoutes = (await import("./auth-routes.js")).default;
    const profileRoutes = (await import("./routes/profileRoutes.js")).default;
    const inventoryRoutes = (await import("./routes/inventoryRoutes.js")).default;

    app.use("/api", authRoutes);
    app.use("/api", profileRoutes);
    app.use("/api", inventoryRoutes);

    console.log("✅ All API routes registered");

    // Serve test file
    app.get("/test-profile", (req, res) => {
      res.sendFile(path.join(__dirname, "test-profile.html"));
    });



    // Catch-all for unknown API routes
    app.use("/api/*", (req, res) => {
      res.status(404).json({
        error: "API endpoint not found",
        method: req.method,
        path: req.originalUrl
      });
    });

    // Error handler
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      console.log(`❌ Error ${status}: ${err.message}`, "error");
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
})();
