import { getDb } from "./db";
import { hashToBucket } from "./hash";
import type { UserContext } from "./types";

function parseBooleanValue(raw: string | null | undefined): boolean {
  if (raw === null || raw === undefined) return false;
  return raw === "true" || raw === "1";
}

export function evaluateFlag(
  flagKey: string,
  environmentSlug: string,
  context: UserContext,
  dbPath?: string
): unknown {
  try {
    const database = getDb(dbPath);
    const flagRow = database.prepare("SELECT * FROM flags WHERE key = ?").get(flagKey) as
      | { id: string; default_value: string }
      | undefined;
    if (!flagRow) return undefined;

    const envRow = database
      .prepare("SELECT * FROM environments WHERE slug = ?")
      .get(environmentSlug) as { id: string } | undefined;
    if (!envRow) return parseBooleanValue(flagRow.default_value);

    const feRow = database
      .prepare(
        "SELECT * FROM flag_environments WHERE flag_id = ? AND environment_id = ?"
      )
      .get(flagRow.id, envRow.id) as
      | { enabled: number; value: string | null; rollout_percentage: number }
      | undefined;

    const defaultVal = flagRow.default_value;

    if (!feRow) return parseBooleanValue(defaultVal);
    if (feRow.enabled === 0) return parseBooleanValue(defaultVal);

    const rolloutPct = Math.min(100, Math.max(0, feRow.rollout_percentage ?? 100));
    const userId = context?.id ?? "anonymous";
    const bucket = hashToBucket(flagKey, userId);
    if (bucket < rolloutPct) {
      const serveVal = feRow.value != null ? feRow.value : defaultVal;
      return parseBooleanValue(serveVal);
    }

    return parseBooleanValue(defaultVal);
  } catch {
    return undefined;
  }
}

export function evaluateAllFlags(
  environmentSlug: string,
  context: UserContext,
  dbPath?: string
): Record<string, unknown> {
  try {
    const database = getDb(dbPath);
    const flags = database.prepare("SELECT key FROM flags").all() as { key: string }[];
    const result: Record<string, unknown> = {};
    for (const { key } of flags) {
      const value = evaluateFlag(key, environmentSlug, context, dbPath);
      if (value !== undefined) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}
