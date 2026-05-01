import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";

import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [path.resolve(__dirname, ".env"), path.resolve(__dirname, ".env.example")];
let envLoaded = false;

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const result = dotenv.config({ path: p });
    if (!result.error) {
      console.log(`✅ Loaded environment from: ${path.basename(p)}`);
      envLoaded = true;
      break;
    }
  }
}

if (!envLoaded) {
  console.warn("⚠️ No environment file (.env or .env.example) found.");
}

// Transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ SMTP credentials not set. Verification code:", code);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"NewsHub Team" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your NewsHub account",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Verify your NewsHub account</h2>
          <p>Thank you for registering! Use the code below to verify your email:</p>
          <div style="font-size: 24px; font-weight: bold; color: #2563eb; padding: 10px; background: #f3f4f6; text-align: center; border-radius: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Best regards,<br>The NewsHub Team</p>
        </div>
      `,
    });
    console.log(`✅ Verification email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
  }
}

async function sendResetPasswordEmail(email: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ SMTP credentials not set. Reset code:", code);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"NewsHub Team" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your NewsHub password",
      text: `Your password reset code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Reset your password</h2>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; color: #2563eb; padding: 10px; background: #f3f4f6; text-align: center; border-radius: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The NewsHub Team</p>
        </div>
      `,
    });
    console.log(`✅ Reset email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Failed to send reset email:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database setup
  const dbFilePath = path.join(process.cwd(), "database.db");
  let db: any;
  const useMySQL = process.env.DB_HOST && process.env.DB_NAME;

  const isSqlJsDatabase = (candidate: any) => {
    return candidate && typeof candidate.export === "function" && typeof candidate.run === "function";
  };

  const isMysqlConnection = (candidate: any) => {
    return candidate && typeof candidate.execute === "function" && typeof candidate.query === "function";
  };

  if (useMySQL) {
    console.log(`Attempting to connect to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}...`);
    try {
      // First, connect without a database name to create the database if missing
      const connectionWithoutDB = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || "",
        port: Number(process.env.DB_PORT) || 3306,
      });
      await connectionWithoutDB.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      await connectionWithoutDB.end();

      db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
      });
      console.log("✅ SUCCESS: Connected to MySQL database and verified schema");
    } catch (err: any) {
      console.error("❌ ERROR: Failed to connect to MySQL.");
      console.error("Error Detail:", err.message);
      console.log("Falling back to SQL.js SQLite for locally stored data...");
    }
  }

  const saveDb = () => {
    try {
      if (isSqlJsDatabase(db)) {
        fs.writeFileSync(dbFilePath, Buffer.from(db.export()));
      }
    } catch (err) {
      console.error("Failed to save SQLite database file:", err);
    }
  };

  if (!db) {
    if (useMySQL) {
      console.warn("⚠️  WARNING: MySQL connection failed. Using local SQLite fallback (database.db).");
    } else {
      console.log("ℹ️  No MySQL environment variables found. Using local SQLite (database.db).");
    }
    const SQL = await initSqlJs({
      locateFile: () => new URL("./node_modules/sql.js/dist/sql-wasm.wasm", import.meta.url).href,
    });
    const fileExists = fs.existsSync(dbFilePath);
    const data = fileExists ? fs.readFileSync(dbFilePath) : undefined;
    db = new SQL.Database(data);
  }

  // Initialize DB schema
  const initSchema = async () => {
    try {
      if (isSqlJsDatabase(db)) {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            is_admin INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            interests TEXT,
            joined_at TEXT,
            is_verified INTEGER DEFAULT 0,
            verification_code TEXT
          )
        `);
        saveDb();
        console.log("SQL.js SQLite schema initialized");
      } else if (isMysqlConnection(db)) {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            bio TEXT,
            avatar_url VARCHAR(255),
            is_admin BOOLEAN DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            interests TEXT,
            joined_at VARCHAR(255),
            is_verified BOOLEAN DEFAULT 0,
            verification_code VARCHAR(10)
          )
        `);
        console.log("MySQL schema initialized");
      } else {
        throw new Error("Unsupported database driver");
      }
    } catch (err) {
      console.error("Schema initialization failed:", err);
    }
  };

  const query = async (sql: string, params: any[] = []) => {
    try {
      if (isSqlJsDatabase(db)) {
        const trimmedSql = sql.trim().toLowerCase();
        if (trimmedSql.startsWith("select")) {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          const rows: any[] = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        }

        const stmt = db.prepare(sql);
        stmt.run(params);
        stmt.free();
        saveDb();
        return { changes: db.getRowsModified?.() ?? 0 };
      }

      if (isMysqlConnection(db)) {
        const [rows] = await db.execute(sql, params);
        return rows;
      }

      throw new Error("Unsupported database driver");
    } catch (err) {
      console.error(`Database query error: ${sql}`, err);
      throw err;
    }
  };

  await initSchema();

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log("  Content-Type:", req.headers['content-type']);
      console.log("  Body:", JSON.stringify(req.body));
    }
    next();
  });

  const tokens = new Map<string, any>();

  app.post("/api/register", async (req, res) => {
    console.log("POST /api/register received:", req.body);
    try {
      const { email, password, full_name } = req.body;
      if (!email || !password) {
        console.log("Register failed: missing email or password");
        return res.status(400).json({ detail: "Email and password are required" });
      }

      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      if (rows && rows.length > 0) {
        console.log(`Register failed: user ${email} already exists`);
        return res.status(400).json({ detail: "User with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const joinedAt = new Date().toISOString();
      const isAdmin = email.includes('admin') ? 1 : 0;
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await query(
        "INSERT INTO users (email, hashed_password, full_name, is_admin, status, joined_at, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [email, hashedPassword, full_name, isAdmin, 'pending', joinedAt, verificationCode, 0]
      );

      await sendVerificationEmail(email, verificationCode);

      const userRows: any = await query("SELECT id, email, full_name, is_admin, status, joined_at, is_verified FROM users WHERE email = ?", [email]);
      const newUser = userRows[0];
      console.log("Register successful for:", email, "Verification code sent.");
      res.json(newUser);
    } catch (err) {
      console.error("Register error detail:", err);
      res.status(500).json({ detail: "Internal server error during registration" });
    }
  });

  app.post("/api/token", async (req, res) => {
    console.log("POST /api/token received:", req.body);
    try {
      const email = req.body.email || req.body.username;
      const password = req.body.password;

      if (!email || !password) {
        console.log("Token failed: missing credentials");
        return res.status(400).json({ detail: "Username and password are required" });
      }

      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows && rows[0];

      if (!user) {
        console.log(`Token failed: user ${email} not found`);
        return res.status(401).json({ detail: "Incorrect email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
      if (!isPasswordValid) {
        console.log(`Token failed: password mismatch for ${email}`);
        return res.status(401).json({ detail: "Incorrect email or password" });
      }

      if (!user.is_verified) {
        console.log(`Token failed: user ${email} is not verified`);
        return res.status(401).json({ detail: "Email not verified. Please verify your email first." });
      }

      const token = `mock-token-${user.id}-${Date.now()}`;
      tokens.set(token, {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: Boolean(user.is_admin),
        status: user.status,
        joined_at: user.joined_at
      });
      
      console.log(`Token issued for: ${email}`);
      res.json({ access_token: token, token_type: "bearer" });
    } catch (err) {
      console.error("Token error detail:", err);
      res.status(500).json({ detail: "Internal server error during token generation" });
    }
  });

  app.get("/api/users/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    const token = authHeader.split(' ')[1];
    const user = tokens.get(token);
    if (!user) {
      return res.status(401).json({ detail: "Invalid token" });
    }
    res.json(user);
  });

  app.post("/api/verify-email", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ detail: "Email and code are required" });
    }

    try {
      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows && rows[0];

      if (!user) {
        return res.status(404).json({ detail: "User not found" });
      }

      if (user.is_verified) {
        return res.json(user);
      }

      if (user.verification_code === code) {
        await query("UPDATE users SET is_verified = 1, status = 'active', verification_code = NULL WHERE id = ?", [user.id]);
        const updatedUserRows: any = await query("SELECT id, email, full_name, is_admin, status, joined_at, is_verified FROM users WHERE id = ?", [user.id]);
        console.log(`User ${email} verified successfully`);
        return res.json(updatedUserRows[0]);
      } else {
        return res.status(400).json({ detail: "Invalid verification code" });
      }
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ detail: "Internal server error during verification" });
    }
  });

  app.post("/api/resend-code", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ detail: "Email is required" });
    }

    try {
      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows && rows[0];

      if (!user) {
        return res.status(404).json({ detail: "User not found" });
      }

      if (user.is_verified) {
        return res.status(400).json({ detail: "Account already verified" });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await query("UPDATE users SET verification_code = ? WHERE id = ?", [verificationCode, user.id]);
      
      await sendVerificationEmail(email, verificationCode);
      res.json({ message: "Verification code sent" });
    } catch (err) {
      console.error("Resend code error:", err);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ detail: "Email is required" });
    }

    try {
      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows && rows[0];

      if (!user) {
        // Return success even if user not found for security
        return res.json({ message: "If this email is registered, a reset code has been sent." });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      await query("UPDATE users SET verification_code = ? WHERE id = ?", [resetCode, user.id]);
      
      await sendResetPasswordEmail(email, resetCode);
      res.json({ message: "If this email is registered, a reset code has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ detail: "Email, code, and new password are required" });
    }

    try {
      const rows: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows && rows[0];

      if (!user) {
        return res.status(404).json({ detail: "User not found" });
      }

      if (user.verification_code !== code) {
        return res.status(400).json({ detail: "Invalid reset code" });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await query(
        "UPDATE users SET hashed_password = ?, verification_code = NULL, is_verified = 1, status = 'active' WHERE id = ?",
        [hashedPassword, user.id]
      );
      
      console.log(`Password reset successfully for: ${email}`);
      res.json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set PORT in your environment or stop the conflicting process.`);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();
