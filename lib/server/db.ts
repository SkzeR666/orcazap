import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { ensureSeed } from "./seed";

/**
 * OrçaZap persistence layer.
 *
 * Uses Node's built-in `node:sqlite` (zero native dependencies). The database
 * file lives under `.data/` at the project root and is created on first use.
 * The schema is applied idempotently so importing this module is always safe.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = process.env.ORCAZAP_DB_PATH ?? path.join(DATA_DIR, "orcazap.db");

let _db: DatabaseSync | null = null;

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS orgs (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  segment           TEXT,
  city              TEXT,
  whatsapp          TEXT,
  email             TEXT,
  document          TEXT,
  address           TEXT,
  logo              TEXT,
  branding_removed  INTEGER NOT NULL DEFAULT 0,
  message_template  TEXT,
  quote_tone        TEXT NOT NULL DEFAULT 'proximo',
  quote_valid_days  INTEGER NOT NULL DEFAULT 7,
  quote_cta         INTEGER NOT NULL DEFAULT 1,
  quote_reminder    INTEGER NOT NULL DEFAULT 1,
  pix_type          TEXT NOT NULL DEFAULT 'email',
  pix_key           TEXT,
  pix_holder        TEXT,
  pix_city          TEXT,
  pix_auto          INTEGER NOT NULL DEFAULT 0,
  pix_qr            INTEGER NOT NULL DEFAULT 1,
  plan              TEXT NOT NULL DEFAULT 'free',
  plan_cycle        TEXT NOT NULL DEFAULT 'monthly',
  plan_since        TEXT,
  created_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  user_id    TEXT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'operator',
  status     TEXT NOT NULL DEFAULT 'active',
  invite_token TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);

CREATE TABLE IF NOT EXISTS clients (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);

CREATE TABLE IF NOT EXISTS services (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  name       TEXT NOT NULL,
  price      INTEGER NOT NULL DEFAULT 0,
  unit       TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_services_org ON services(org_id);

CREATE TABLE IF NOT EXISTS templates (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_templates_org ON templates(org_id);

CREATE TABLE IF NOT EXISTS quotes (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  public_id    TEXT NOT NULL UNIQUE,
  client_id    TEXT,
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  service_name TEXT NOT NULL,
  amount       INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'rascunho',
  notes        TEXT,
  valid_days   INTEGER NOT NULL DEFAULT 7,
  live         INTEGER NOT NULL DEFAULT 0,
  live_step    INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_quotes_org ON quotes(org_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(org_id, created_at);

CREATE TABLE IF NOT EXISTS quote_events (
  id          TEXT PRIMARY KEY,
  quote_id    TEXT NOT NULL,
  org_id      TEXT NOT NULL,
  type        TEXT NOT NULL,
  from_status TEXT,
  to_status   TEXT,
  note        TEXT,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events(quote_id);

CREATE TABLE IF NOT EXISTS charges (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  quote_id   TEXT,
  method     TEXT NOT NULL DEFAULT 'pix',
  amount     INTEGER NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'pendente',
  brcode     TEXT,
  txid       TEXT,
  pix_key    TEXT,
  created_at TEXT NOT NULL,
  paid_at    TEXT,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_charges_org ON charges(org_id);

CREATE TABLE IF NOT EXISTS subscription_events (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  plan       TEXT NOT NULL,
  cycle      TEXT NOT NULL,
  amount     INTEGER NOT NULL DEFAULT 0,
  note       TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sub_events_org ON subscription_events(org_id);

CREATE TABLE IF NOT EXISTS webhook_events (
  id         TEXT PRIMARY KEY,
  org_id     TEXT,
  source     TEXT NOT NULL,
  kind       TEXT NOT NULL,
  payload    TEXT,
  created_at TEXT NOT NULL
);
`;

function connect(): DatabaseSync {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = connect();
    // Seed a demo tenant so a fresh database is immediately usable.
    try {
      ensureSeed(_db);
    } catch (err) {
      // Seed is best-effort; the API works on an empty database too.
      console.error("[db] seed failed:", err);
    }
  }
  return _db;
}

/** Test/maintenance helper: close the connection so it re-opens on next use. */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
