#!/usr/bin/env node
/**
 * One-way sync: Supabase (Postgres, source of truth) -> MySQL/MariaDB mirror.
 *
 * The live site writes to Supabase. This script copies those rows into the
 * Hostinger MySQL database so both databases stay usable. It is:
 *   - incremental    : only rows newer than the stored watermark are read
 *   - idempotent     : re-running changes nothing (INSERT ... ON DUPLICATE KEY UPDATE)
 *   - non-destructive: it never issues DELETE or DROP, in either database
 *
 * It runs as a standalone Node process, NOT inside the deployed app, because
 * Cloudflare Workers cannot open a raw TCP connection to MySQL on port 3306.
 *
 * Required environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Supabase dashboard -> Settings -> API)
 *   MYSQL_HOST  MYSQL_PORT  MYSQL_USER  MYSQL_PASSWORD  MYSQL_DATABASE
 *
 * Usage:
 *   node scripts/sync-supabase-to-mysql.mjs            # incremental
 *   node scripts/sync-supabase-to-mysql.mjs --full     # re-read everything
 *   node scripts/sync-supabase-to-mysql.mjs --dry-run  # read only, write nothing
 */

import process from "node:process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import mysql from "mysql2/promise";

const FULL = process.argv.includes("--full");
const DRY_RUN = process.argv.includes("--dry-run");

const PAGE_SIZE = 1000; // rows fetched per Supabase request
const BATCH_SIZE = 200; // rows per MySQL multi-row INSERT

/** Tables to mirror. `watermark` is the column that drives incremental reads. */
const TABLES = [
  {
    name: "leads",
    watermark: "updated_at",
    columns: [
      "id",
      "created_at",
      "updated_at",
      "name",
      "email",
      "phone",
      "project",
      "message",
      "source",
      "status",
      "notes",
      "consent_contact",
      "consent_privacy",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "referrer",
      "landing_page",
    ],
    timestamps: ["created_at", "updated_at"],
    booleans: ["consent_contact", "consent_privacy"],
  },
  {
    name: "page_visits",
    watermark: "created_at",
    columns: [
      "id",
      "created_at",
      "landing_page",
      "referrer",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "country",
      "region",
      "city",
      "ip",
      "user_agent",
    ],
    timestamps: ["created_at"],
    booleans: [],
  },
  {
    name: "user_roles",
    watermark: "created_at",
    columns: ["id", "user_id", "role", "created_at"],
    timestamps: ["created_at"],
    booleans: [],
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error("\n  Missing environment variable: " + name);
    console.error("  See the header of this file for the full list.\n");
    process.exit(1);
  }
  return value;
}

/** Postgres timestamptz (ISO, any offset) -> MySQL DATETIME(6) string in UTC. */
function toMysqlDateTime(value) {
  if (value === null || value === undefined) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const millis = String(d.getUTCMilliseconds()).padStart(3, "0");
  return d.toISOString().slice(0, 19).replace("T", " ") + "." + millis + "000";
}

function toMysqlValue(table, column, raw) {
  if (raw === null || raw === undefined) return null;
  if (table.timestamps.includes(column)) return toMysqlDateTime(raw);
  if (table.booleans.includes(column)) return raw ? 1 : 0;
  if (typeof raw === "object") return JSON.stringify(raw);
  return raw;
}

async function readWatermark(conn, tableName) {
  if (FULL) return null;
  const [rows] = await conn.execute("SELECT last_synced_at FROM sync_state WHERE table_name = ?", [
    tableName,
  ]);
  return rows.length ? rows[0].last_synced_at : null;
}

async function writeSyncState(conn, tableName, lastSyncedAt, rowCount, errorMessage) {
  const sql = [
    "INSERT INTO sync_state (table_name, last_synced_at, last_run_at, rows_synced, last_error)",
    "VALUES (?, ?, UTC_TIMESTAMP(6), ?, ?)",
    "ON DUPLICATE KEY UPDATE",
    "  last_synced_at = COALESCE(VALUES(last_synced_at), last_synced_at),",
    "  last_run_at    = VALUES(last_run_at),",
    "  rows_synced    = rows_synced + VALUES(rows_synced),",
    "  last_error     = VALUES(last_error)",
  ].join("\n");
  await conn.execute(sql, [tableName, lastSyncedAt, rowCount, errorMessage ?? null]);
}

/** Upsert one batch. Existing rows are updated in place; nothing is ever deleted. */
export async function upsertBatch(conn, table, rows) {
  const cols = table.columns;
  const quoted = cols.map((c) => "`" + c + "`").join(", ");
  const rowPlaceholder = "(" + cols.map(() => "?").join(", ") + ", UTC_TIMESTAMP(6))";
  const updates = cols
    .filter((c) => c !== "id")
    .map((c) => "`" + c + "` = VALUES(`" + c + "`)")
    .join(", ");

  const sql =
    "INSERT INTO `" +
    table.name +
    "` (" +
    quoted +
    ", synced_at) VALUES " +
    rows.map(() => rowPlaceholder).join(", ") +
    " ON DUPLICATE KEY UPDATE " +
    updates +
    ", synced_at = UTC_TIMESTAMP(6)";

  const params = [];
  for (const row of rows) {
    for (const col of cols) params.push(toMysqlValue(table, col, row[col]));
  }
  await conn.execute(sql, params);
}

async function syncTable(supabase, conn, table) {
  const since = await readWatermark(conn, table.name);
  // MySQL returns a Date for DATETIME columns; normalise to an ISO string for Supabase.
  const sinceIso = since ? new Date(since).toISOString() : null;

  console.log(
    "\n" + table.name + ": " + (sinceIso ? "incremental since " + sinceIso : "full read"),
  );

  let offset = 0;
  let total = 0;
  let maxWatermark = null;

  for (;;) {
    let query = supabase
      .from(table.name)
      .select(table.columns.join(","))
      .order(table.watermark, { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (sinceIso) query = query.gte(table.watermark, sinceIso);

    const { data, error } = await query;
    if (error) throw new Error("Supabase read failed for " + table.name + ": " + error.message);
    if (!data || data.length === 0) break;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      if (!DRY_RUN) await upsertBatch(conn, table, batch);
      total += batch.length;
    }

    const lastValue = data[data.length - 1][table.watermark];
    const asMysql = toMysqlDateTime(lastValue);
    if (asMysql && (!maxWatermark || asMysql > maxWatermark)) maxWatermark = asMysql;

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  if (!DRY_RUN) await writeSyncState(conn, table.name, maxWatermark, total, null);
  console.log("  " + table.name + ": " + total + " rows synced" + (DRY_RUN ? " (dry run)" : ""));
  return total;
}

async function main() {
  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const conn = await mysql.createConnection({
    host: requireEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT || 3306),
    user: requireEnv("MYSQL_USER"),
    password: requireEnv("MYSQL_PASSWORD"),
    database: requireEnv("MYSQL_DATABASE"),
    timezone: "Z",
    connectTimeout: 20000,
  });

  console.log("Sync starting" + (FULL ? " (--full)" : "") + (DRY_RUN ? " (--dry-run)" : ""));

  let grandTotal = 0;
  try {
    for (const table of TABLES) {
      try {
        grandTotal += await syncTable(supabase, conn, table);
      } catch (err) {
        console.error("\n  " + table.name + " FAILED: " + err.message);
        if (!DRY_RUN) {
          await writeSyncState(conn, table.name, null, 0, err.message).catch(() => {});
        }
        throw err;
      }
    }
    console.log("\nDone. " + grandTotal + " rows total.");
  } finally {
    await conn.end();
  }
}

export { TABLES, toMysqlDateTime, toMysqlValue };

// Only run when executed directly, so the helpers above can be imported in tests.
const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isEntryPoint) {
  main().catch((err) => {
    console.error("\nSync failed: " + err.message);
    process.exit(1);
  });
}
