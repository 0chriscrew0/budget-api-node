// src/server.js

// Load environment variables from .env (e.g., PORT, CORS_ORIGIN)
import "dotenv/config";

import express from "express";
import cors from "cors";

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

// Some providers send HEAD / — respond 200 so health checks pass
app.head("/", (_req, res) => res.sendStatus(200));

// Simple root route so you can see something in the browser
app.get("/", (_req, res) => {
  res.json({ message: "Budget API (Node) — bootstrap running" });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
