-- MySQL / MariaDB mirror of the Supabase (Postgres) schema.
--
-- Supabase stays the source of truth: the live site writes there.
-- This database is kept in step by scripts/sync-supabase-to-mysql.mjs.
--
-- Type mapping notes:
--   uuid        -> CHAR(36)      (Postgres uuid rendered as text)
--   timestamptz -> DATETIME(6)   (stored in UTC; MariaDB has no tz-aware type)
--   boolean     -> TINYINT(1)
--   text        -> TEXT / VARCHAR where it is indexed
--
-- Safe to re-run: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS leads (
  id               CHAR(36)     NOT NULL,
  created_at       DATETIME(6)  NOT NULL,
  updated_at       DATETIME(6)  NOT NULL,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(320) NOT NULL,
  phone            VARCHAR(64)  NOT NULL,
  project          VARCHAR(255)     NULL,
  message          TEXT             NULL,
  source           VARCHAR(64)  NOT NULL DEFAULT 'lead-form',
  status           VARCHAR(32)  NOT NULL DEFAULT 'new',
  notes            TEXT             NULL,
  consent_contact  TINYINT(1)   NOT NULL DEFAULT 0,
  consent_privacy  TINYINT(1)   NOT NULL DEFAULT 0,
  utm_source       VARCHAR(255)     NULL,
  utm_medium       VARCHAR(255)     NULL,
  utm_campaign     VARCHAR(255)     NULL,
  utm_term         VARCHAR(255)     NULL,
  utm_content      VARCHAR(255)     NULL,
  referrer         TEXT             NULL,
  landing_page     TEXT             NULL,
  -- bookkeeping, not present in Supabase
  synced_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_leads_created_at (created_at),
  KEY idx_leads_updated_at (updated_at),
  KEY idx_leads_status     (status),
  KEY idx_leads_email      (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_visits (
  id            CHAR(36)     NOT NULL,
  created_at    DATETIME(6)  NOT NULL,
  landing_page  TEXT             NULL,
  referrer      TEXT             NULL,
  utm_source    VARCHAR(255)     NULL,
  utm_medium    VARCHAR(255)     NULL,
  utm_campaign  VARCHAR(255)     NULL,
  utm_term      VARCHAR(255)     NULL,
  utm_content   VARCHAR(255)     NULL,
  country       VARCHAR(128)     NULL,
  region        VARCHAR(128)     NULL,
  city          VARCHAR(128)     NULL,
  ip            VARCHAR(64)      NULL,
  user_agent    TEXT             NULL,
  synced_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_visits_created_at (created_at),
  KEY idx_visits_utm_source (utm_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  id          CHAR(36)    NOT NULL,
  user_id     CHAR(36)    NOT NULL,
  role        ENUM('admin','user') NOT NULL,
  created_at  DATETIME(6) NOT NULL,
  synced_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_roles_user_role (user_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tracks how far each table has been synced, so runs are incremental.
CREATE TABLE IF NOT EXISTS sync_state (
  table_name     VARCHAR(64) NOT NULL,
  last_synced_at DATETIME(6)     NULL,
  last_run_at    DATETIME(6)     NULL,
  rows_synced    BIGINT      NOT NULL DEFAULT 0,
  last_error     TEXT            NULL,
  PRIMARY KEY (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
