// src/server.js

// Load environment variables from .env (e.g., PORT, CORS_ORIGIN)
import "dotenv/config";

import express from "express";
import cors from "cors";
import { verifyDb, pool } from "./db.js";

const app = express();

// Parse JSON bodies
app.use(express.json());

// Allow your frontend to call this API.
// In dev, set CORS_ORIGIN=http://localhost:5173 in your .env.
// You can comma-separate multiple origins later for prod.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: false,
  })
);

// Health endpoint so platforms like Render can check liveness
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ status: "ok", now: r.rows[0].now });
  } catch (err) {
    console.error("DB health error:", err);
    res.status(500).json({ status: "error" });
  }
});

// Some providers send HEAD / — respond 200 so health checks pass
app.head("/", (_req, res) => res.sendStatus(200));

// Simple root route so you can see something in the browser
app.get("/", (_req, res) => {
  res.json({ message: "Budget API (Node) — bootstrap running" });
});

const port = process.env.PORT || 10000;

(async () => {
  try {
    await verifyDb(); // ensure Supabase is reachable before serving
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start: DB not reachable.", err);
    process.exit(1);
  }
})();
