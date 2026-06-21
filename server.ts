import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const BACKEND_PORT = 8000;
  const SUPPORT_PORT = 8085;

  app.use(cors());

  // Spawn FastAPI backend
  console.log("🚀 Starting FastAPI backend...");
  const pythonCommand = process.platform === "win32" ? "python" : "python3";
  const pythonProcess = spawn(pythonCommand, [
    "-m", "uvicorn",
    "backend.app.main:app",
    "--host", "0.0.0.0",
    "--port", BACKEND_PORT.toString()
  ], {
    stdio: "inherit",
    env: process.env
  });

  pythonProcess.on("error", (err) => {
    console.error("❌ Failed to start FastAPI backend:", err);
  });

  // Spawn Support Service backend
  console.log("🚀 Starting Support Service backend on port " + SUPPORT_PORT + "...");
  const supportProcess = spawn(pythonCommand, [
    "-m", "uvicorn",
    "app.main:app",
    "--host", "0.0.0.0",
    "--port", SUPPORT_PORT.toString()
  ], {
    cwd: path.join(__dirname, "support-service"),
    stdio: "inherit",
    env: process.env
  });

  supportProcess.on("error", (err) => {
    console.error("❌ Failed to start Support Service backend:", err);
  });

  // Proxy support requests to Support Service
  const supportProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${SUPPORT_PORT}`,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Support Proxy Error:", err);
      (res as any).status(502).json({ detail: "Support backend is not responding" });
    }
  });

  app.use("/support", supportProxy);
  app.use("/admin/support", supportProxy);

  // Proxy API requests to FastAPI
  app.use("/api", createProxyMiddleware({
    target: `http://127.0.0.1:${BACKEND_PORT}`,
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
    onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      (res as any).status(502).json({ detail: "Backend is not responding" });
    }
  }));

  // Proxy FastAPI docs and openapi schema
  const docsProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${BACKEND_PORT}`,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Docs Proxy Error:", err);
      (res as any).status(502).json({ detail: "Backend is not responding" });
    }
  });

  app.use("/docs", docsProxy);
  app.use("/redoc", docsProxy);
  app.use("/openapi.json", docsProxy);

  // Proxy /static requests to FastAPI (for article images)
  app.use("/static", createProxyMiddleware({
    target: `http://127.0.0.1:${BACKEND_PORT}`,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Static Proxy Error:", err);
      (res as any).status(502).json({ detail: "Backend is not responding" });
    }
  }));

  app.use(express.json());

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
    console.log(`🔗 Proxying /api to http://localhost:${BACKEND_PORT}`);
  });

  // Handle support service Websocket upgrades
  const wsProxy = createProxyMiddleware({
    target: `ws://127.0.0.1:${SUPPORT_PORT}`,
    changeOrigin: true,
    ws: true,
    onError: (err, req, res) => {
      console.error("WS Proxy Upgrade Error:", err);
    }
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url && req.url.startsWith("/ws")) {
      wsProxy.upgrade(req as any, socket as any, head as any);
    }
  });

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();
