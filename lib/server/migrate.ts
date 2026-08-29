import type { DatabaseSync } from "node:sqlite";

/**
 * Ordered, idempotent migrations applied after the base schema. Each entry is
 * recorded in `_migrations` once run, so adding a new one here evolves existing
 * databases without a rebuild. `addColumn` swallows the duplicate-column error,
 * making every step safe to re-run against a fresh database too.
 */

type Migration = { name: string; up: (db: DatabaseSync) => void };

function addColumn(db: DatabaseSync, table: string, ddl: string): void {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl};`);
  } catch (err) {
    if (!/duplicate column name/i.test(String(err))) throw err;
  }
}

const MIGRATIONS: Migration[] = [
  {
    name: "001_email_verification",
    up: (db) => {
      addColumn(db, "users", "email_verified INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "users", "verification_token TEXT");
    },
  },
  {
    name: "002_session_active_org",
    up: (db) => {
      addColumn(db, "sessions", "active_org_id TEXT");
    },
  },
  {
    name: "003_password_resets",
    up: (db) => {
      db.exec(`CREATE TABLE IF NOT EXISTS password_resets (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used_at    TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`);
      db.exec(
        "CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);",
      );
    },
  },
  {
    name: "004_org_logos",
    up: (db) => {
      db.exec(`CREATE TABLE IF NOT EXISTS org_logos (
        org_id     TEXT PRIMARY KEY,
        mime       TEXT NOT NULL,
        data       BLOB NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
      );`);
    },
  },
  {
    name: "005_webhook_idempotency",
    up: (db) => {
      addColumn(db, "webhook_events", "event_id TEXT");
      db.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_event ON webhook_events(event_id) WHERE event_id IS NOT NULL;",
      );
    },
  },
];

export function runMigrations(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );`);

  const applied = new Set(
    (db.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );

  for (const m of MIGRATIONS) {
    if (applied.has(m.name)) continue;
    m.up(db);
    db.prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)").run(
      m.name,
      new Date().toISOString(),
    );
  }
}
