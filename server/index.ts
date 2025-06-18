import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

// Import ES modules
import { registerRoutes } from "./routes.js";
import connectDB from "./config/database.js";
import createSeedUsers from "./seed/seedUsers.js";

const app = express();
// Basic middleware - JSON parsing will be handled by API router

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create seed users after database connection
    await createSeedUsers();
    
    // Create HTTP server first
    const server = createServer(app);

    // CRITICAL: Register API routes FIRST with complete bypass of Vite
    app.use('/api', (req, res, next) => {
      // Immediately set JSON headers to prevent any HTML responses
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-API-Response', 'true');
      next();
    });

    await registerRoutes(app);
    log("API routes registered successfully");

    // Add catch-all for unmatched API routes BEFORE Vite
    app.use('/api/*', (req, res) => {
      res.status(404).json({ error: 'API endpoint not found', method: req.method, path: req.originalUrl });
    });

    // Setup Vite/static serving ONLY for non-API routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      await setupVite(app, server);
      log("Vite middleware setup complete");
    }

    // Error handling middleware (should be last)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error ${status}: ${message}`, "error");
      res.status(status).json({ message });
    });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
