import { Application } from "express";
import { createServer } from "http";
import router from "./routes/index";

export async function registerRoutes(app: Application) {
  // Register API routes
  app.use("/api", router);
  
  const server = createServer(app);
  return server;
} 