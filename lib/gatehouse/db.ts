import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Flag, FlagEnvironment, Environment, AuditLogEntry } from "./types";

const DEFAULT_DB_PATH = ".gatehouse/flags.db";

let db: Database.Database | null = null;

function getDbPath(dbPath?: string): string {
  const base = dbPath ?? process.cwd();
  return path.isAbsolute(dbPath ?? DEFAULT_DB_PATH)
    ? (dbPath as string)
    : path.join(process.cwd(), dbPath ?? DEFAULT_DB_PATH);
}

export function getDb(dbPath?: string): Database.Database {
  if (db) return db;
  const fullPath = getDbPath(dbPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  db = new Database(fullPath);
  runMigrations(db);
  return db;
}

function runMigrations(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS environments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'boolean',
      default_value TEXT NOT NULL DEFAULT 'false',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flag_environments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      flag_id TEXT NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
      environment_id TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
      enabled INTEGER NOT NULL DEFAULT 0,
      value TEXT,
      rollout_percentage INTEGER DEFAULT 100,
      rules TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(flag_id, environment_id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flag_key TEXT NOT NULL,
      environment TEXT,
      action TEXT NOT NULL,
      changes TEXT DEFAULT '{}',
      actor TEXT DEFAULT 'system',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = database.prepare("SELECT COUNT(*) as c FROM environments").get() as { c: number };
  if (count.c === 0) {
    const insert = database.prepare(
      "INSERT INTO environments (id, name, slug, color) VALUES (?, ?, ?, ?)"
    );
    insert.run("dev", "Development", "development", "#6366f1");
    insert.run("staging", "Staging", "staging", "#2dd4bf");
    insert.run("prod", "Production", "production", "#f59e0b");
  }
}

const ENVIRONMENT_ORDER = ["development", "staging", "production"];

export function listEnvironments(dbPath?: string): Environment[] {
  const database = getDb(dbPath);
  const rows = database.prepare("SELECT * FROM environments").all() as Environment[];
  return rows.slice().sort((a, b) => {
    const i = ENVIRONMENT_ORDER.indexOf(a.slug);
    const j = ENVIRONMENT_ORDER.indexOf(b.slug);
    if (i !== -1 && j !== -1) return i - j;
    if (i !== -1) return -1;
    if (j !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function getEnvironmentBySlug(slug: string, dbPath?: string): Environment | null {
  const database = getDb(dbPath);
  const row = database.prepare("SELECT * FROM environments WHERE slug = ?").get(slug) as Environment | undefined;
  return row ?? null;
}

export function getEnvironmentById(id: string, dbPath?: string): Environment | null {
  const database = getDb(dbPath);
  const row = database.prepare("SELECT * FROM environments WHERE id = ?").get(id) as Environment | undefined;
  return row ?? null;
}

export function createEnvironment(
  name: string,
  slug: string,
  color: string = "#6366f1",
  dbPath?: string
): Environment {
  const database = getDb(dbPath);
  const id = generateId();
  database.prepare("INSERT INTO environments (id, name, slug, color) VALUES (?, ?, ?, ?)").run(id, name, slug, color);
  return database.prepare("SELECT * FROM environments WHERE id = ?").get(id) as Environment;
}

function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function listFlags(_tag?: string, dbPath?: string): Flag[] {
  const database = getDb(dbPath);
  return database.prepare("SELECT * FROM flags ORDER BY key").all() as Flag[];
}

export function getFlagByKey(key: string, dbPath?: string): Flag | null {
  const database = getDb(dbPath);
  const row = database.prepare("SELECT * FROM flags WHERE key = ?").get(key) as Flag | undefined;
  return row ?? null;
}

export function getFlagById(id: string, dbPath?: string): Flag | null {
  const database = getDb(dbPath);
  const row = database.prepare("SELECT * FROM flags WHERE id = ?").get(id) as Flag | undefined;
  return row ?? null;
}

export function createFlag(
  key: string,
  name: string,
  options: { description?: string; type?: string; default_value?: string } = {},
  dbPath?: string
): Flag {
  const database = getDb(dbPath);
  const id = generateId();
  const description = options.description ?? "";
  const type = options.type ?? "boolean";
  const default_value = options.default_value ?? "false";
  database
    .prepare(
      "INSERT INTO flags (id, key, name, description, type, default_value) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(id, key, name, description, type, default_value);

  const envs = listEnvironments(dbPath);
  const insertFe = database.prepare(
    "INSERT INTO flag_environments (id, flag_id, environment_id, enabled) VALUES (?, ?, ?, 0)"
  );
  for (const env of envs) {
    insertFe.run(generateId(), id, env.id);
  }
  return database.prepare("SELECT * FROM flags WHERE id = ?").get(id) as Flag;
}

export function updateFlag(
  key: string,
  updates: { name?: string; description?: string; type?: string; default_value?: string },
  dbPath?: string
): Flag | null {
  const database = getDb(dbPath);
  const flag = getFlagByKey(key, dbPath);
  if (!flag) return null;
  const name = updates.name ?? flag.name;
  const description = updates.description ?? flag.description;
  const type = updates.type ?? flag.type;
  const default_value = updates.default_value ?? flag.default_value;
  database
    .prepare(
      "UPDATE flags SET name = ?, description = ?, type = ?, default_value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?"
    )
    .run(name, description, type, default_value, key);
  return getFlagByKey(key, dbPath);
}

export function deleteFlag(key: string, dbPath?: string): boolean {
  const database = getDb(dbPath);
  const flag = getFlagByKey(key, dbPath);
  if (!flag) return false;
  database.prepare("DELETE FROM flags WHERE key = ?").run(key);
  return true;
}

export function getFlagEnvironments(flagId: string, dbPath?: string): FlagEnvironment[] {
  const database = getDb(dbPath);
  return database
    .prepare("SELECT * FROM flag_environments WHERE flag_id = ? ORDER BY environment_id")
    .all(flagId) as FlagEnvironment[];
}

export function getFlagEnvironmentByFlagAndEnv(
  flagId: string,
  environmentId: string,
  dbPath?: string
): FlagEnvironment | null {
  const database = getDb(dbPath);
  const row = database
    .prepare("SELECT * FROM flag_environments WHERE flag_id = ? AND environment_id = ?")
    .get(flagId, environmentId) as FlagEnvironment | undefined;
  return row ?? null;
}

export function getFlagEnvironmentByFlagKeyAndSlug(
  flagKey: string,
  envSlug: string,
  dbPath?: string
): FlagEnvironment | null {
  const flag = getFlagByKey(flagKey, dbPath);
  if (!flag) return null;
  const env = getEnvironmentBySlug(envSlug, dbPath);
  if (!env) return null;
  return getFlagEnvironmentByFlagAndEnv(flag.id, env.id, dbPath);
}

export function updateFlagEnvironment(
  flagKey: string,
  envSlug: string,
  updates: {
    enabled?: number;
    value?: string | null;
    rollout_percentage?: number;
    rules?: string;
  },
  dbPath?: string
): FlagEnvironment | null {
  const database = getDb(dbPath);
  const fe = getFlagEnvironmentByFlagKeyAndSlug(flagKey, envSlug, dbPath);
  if (!fe) return null;
  const enabled = updates.enabled !== undefined ? updates.enabled : fe.enabled;
  const value = updates.value !== undefined ? updates.value : fe.value;
  const rollout_percentage = updates.rollout_percentage !== undefined ? updates.rollout_percentage : fe.rollout_percentage;
  const rules = updates.rules !== undefined ? updates.rules : fe.rules;
  database
    .prepare(
      "UPDATE flag_environments SET enabled = ?, value = ?, rollout_percentage = ?, rules = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .run(enabled, value, rollout_percentage, rules, fe.id);
  return getFlagEnvironmentByFlagKeyAndSlug(flagKey, envSlug, dbPath);
}

export function addAuditLog(
  flagKey: string,
  action: string,
  options: { environment?: string; changes?: string; actor?: string } = {},
  dbPath?: string
) {
  const database = getDb(dbPath);
  database
    .prepare(
      "INSERT INTO audit_log (flag_key, environment, action, changes, actor) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      flagKey,
      options.environment ?? null,
      action,
      options.changes ?? "{}",
      options.actor ?? "system"
    );
}

export function getAuditLog(
  options: { flag?: string; limit?: number } = {},
  dbPath?: string
): AuditLogEntry[] {
  const database = getDb(dbPath);
  const limit = options.limit ?? 100;
  if (options.flag) {
    return database
      .prepare("SELECT * FROM audit_log WHERE flag_key = ? ORDER BY id DESC LIMIT ?")
      .all(options.flag, limit) as AuditLogEntry[];
  }
  return database.prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?").all(limit) as AuditLogEntry[];
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
