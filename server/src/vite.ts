import { Application } from "express";
import { Server } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import express from "express";

export function log(message: string) {
  console.log(`[server] ${message}`);
}

export async function setupVite(app: Application, server: Server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Application) {
  const clientDist = path.join(process.cwd(), "dist", "client");
  app.use(express.static(clientDist));
  
  // Serve index.html for all other routes to enable SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} 