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

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();
