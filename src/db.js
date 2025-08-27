// src/db.js
import pkg from "pg";
const { Pool } = pkg;

const url = process.env.DATABASE_URL || "";

// Map DB_SSL_MODE to pg ssl config
// - disable    → false
// - no-verify  → { rejectUnauthorized: false }
// - require    → { rejectUnauthorized: true }  (default)
const sslMode = (process.env.DB_SSL_MODE || "require").toLowerCase();

let ssl;
if (sslMode === "disable") {
  ssl = false;
} else if (sslMode === "no-verify") {
  ssl = { rejectUnauthorized: false };
} else {
  // "require" or anything else → strict verify
  ssl = { rejectUnauthorized: true };
}

export const pool = new Pool({
  connectionString: url,
  ssl,
});

export async function verifyDb() {
  const res = await pool.query("select 1 as ok");
  if (res.rows?.[0]?.ok !== 1) {
    throw new Error("DB health check failed");
  }
  return true;
}
