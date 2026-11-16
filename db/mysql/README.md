# MySQL mirror

The app runs on **Supabase** (Postgres). This folder keeps a **MySQL/MariaDB mirror**
of that data on Hostinger, so both databases stay usable.

## How it fits together

```
  Live site (salesinfopro.com)
          │  writes leads + page visits
          ▼
  Supabase (Postgres)  ←── source of truth, the app reads/writes only here
          │
          │  scripts/sync-supabase-to-mysql.mjs  (one-way, read-only on Supabase)
          ▼
  MySQL on Hostinger   ←── mirror, safe to query from phpMyAdmin / BI tools
```

**The sync is one-way: Supabase → MySQL.** Rows written directly into MySQL are never
copied back, and would be overwritten if the same `id` later changes in Supabase.
Treat MySQL as read-only.

### Why the sync is a separate script, not part of the app

The site deploys to Cloudflare Workers, which cannot open a raw TCP connection to
MySQL on port 3306. Supabase works there because it speaks HTTPS. So the sync runs
as an ordinary Node process — on a GitHub Actions schedule, or by hand.

Keeping it outside the request path also means **a MySQL outage can never break lead
capture**. The form keeps writing to Supabase; the mirror just catches up later.

## First-time setup

**1. Create the tables** (safe to re-run — every statement is `IF NOT EXISTS`):

```bash
mysql -h srv789.hstgr.io -u <user> -p <database> < db/mysql/schema.sql
```

**2. Configure credentials:**

```bash
cp .env.sync.example .env.sync
# then fill in SUPABASE_SERVICE_ROLE_KEY and MYSQL_PASSWORD
```

The `service_role` key comes from the Supabase dashboard → Project Settings → API.
It bypasses RLS, so it is a secret: `.env.sync` is gitignored, keep it that way.

**3. Run the first full sync:**

```bash
set -a && . ./.env.sync && set +a
npm run sync:mysql:full
```

## Running it

| Command | What it does |
| --- | --- |
| `npm run sync:mysql` | Incremental — only rows changed since the last run |
| `npm run sync:mysql:full` | Re-reads every row (still an upsert, nothing is duplicated) |
| `node scripts/sync-supabase-to-mysql.mjs --dry-run` | Reads and reports, writes nothing |

The script is **idempotent** — running it twice changes nothing — and it
**never deletes**, in either database.

## Automatic syncing

`.github/workflows/sync-mysql.yml` runs the sync hourly. It needs these repository
secrets (Settings → Secrets and variables → Actions):

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MYSQL_HOST`, `MYSQL_PORT`,
`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

You can also trigger it manually from the Actions tab, with an optional "full" re-read.

## Tables

| MySQL table | Mirrors | Notes |
| --- | --- | --- |
| `leads` | `public.leads` | Watermarked on `updated_at`, so status/notes edits sync too |
| `page_visits` | `public.page_visits` | Append-only, watermarked on `created_at` |
| `user_roles` | `public.user_roles` | Append-only |
| `sync_state` | — | Bookkeeping: watermark, last run, row count, last error |

Type mapping: `uuid` → `CHAR(36)`, `timestamptz` → `DATETIME(6)` **stored in UTC**,
`boolean` → `TINYINT(1)`. Each mirrored table also carries a `synced_at` column
recording when the row was last written by the sync.

## Checking sync health

```sql
SELECT * FROM sync_state;
```

`last_synced_at` is the high-water mark per table, `last_run_at` is when the sync last
ran, and `last_error` is non-null if the last attempt failed.
