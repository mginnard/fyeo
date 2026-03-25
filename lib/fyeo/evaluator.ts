import { getDb } from "./db";
import { hashToBucket } from "./hash";
import type { UserContext, TargetingRule, FlagType } from "./types";

function parseValue(raw: string, type: FlagType): unknown {
  if (raw === null || raw === undefined) return raw;
  switch (type) {
    case "boolean":
      return raw === "true" || raw === "1";
    case "number":
      return Number(raw);
    case "json":
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    case "string":
    default:
      return raw;
  }
}

function matchRule(rule: TargetingRule, context: UserContext): boolean {
  const attrValue = context[rule.attribute];
  const values = rule.values ?? (rule.value != null ? [rule.value] : []);

  const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

  switch (rule.operator) {
    case "eq":
      return attrValue === values[0] || str(attrValue) === str(values[0]);
    case "neq":
      return attrValue !== values[0] && str(attrValue) !== str(values[0]);
    case "contains":
      return str(attrValue).includes(str(values[0]));
    case "startsWith":
      return str(attrValue).startsWith(str(values[0]));
    case "endsWith":
      return str(attrValue).endsWith(str(values[0]));
    case "in":
      return values.some((v) => attrValue === v || str(attrValue) === str(v));
    case "nin":
      return !values.some((v) => attrValue === v || str(attrValue) === str(v));
    case "gt":
      return Number(attrValue) > Number(values[0]);
    case "gte":
      return Number(attrValue) >= Number(values[0]);
    case "lt":
      return Number(attrValue) < Number(values[0]);
    case "lte":
      return Number(attrValue) <= Number(values[0]);
    case "regex":
      try {
        return new RegExp(str(values[0])).test(str(attrValue));
      } catch {
        return false;
      }
    case "semver_eq":
    case "semver_gt":
    case "semver_lt": {
      const a = str(attrValue);
      const b = str(values[0]);
      const cmp = semverCompare(a, b);
      if (cmp === null) return false;
      if (rule.operator === "semver_eq") return cmp === 0;
      if (rule.operator === "semver_gt") return cmp > 0;
      return cmp < 0;
    }
    default:
      return false;
  }
}

function semverCompare(a: string, b: string): number | null {
  const parse = (s: string) => {
    const m = s.replace(/^v/i, "").match(/^(\d+)\.?(\d*)\.?(\d*)/);
    if (!m) return null;
    return [parseInt(m[1], 10), parseInt(m[2] || "0", 10), parseInt(m[3] || "0", 10)] as const;
  };
  const va = parse(a);
  const vb = parse(b);
  if (!va || !vb) return null;
  if (va[0] !== vb[0]) return va[0] - vb[0];
  if (va[1] !== vb[1]) return va[1] - vb[1];
  return va[2] - vb[2];
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
      | { id: string; type: string; default_value: string }
      | undefined;
    if (!flagRow) return undefined;

    const envRow = database
      .prepare("SELECT * FROM environments WHERE slug = ?")
      .get(environmentSlug) as { id: string } | undefined;
    if (!envRow) return parseValue(flagRow.default_value, flagRow.type as FlagType);

    const feRow = database
      .prepare(
        "SELECT * FROM flag_environments WHERE flag_id = ? AND environment_id = ?"
      )
      .get(flagRow.id, envRow.id) as
      | { enabled: number; value: string | null; rollout_percentage: number; rules: string }
      | undefined;

    const defaultVal = flagRow.default_value;
    const type = flagRow.type as FlagType;

    if (!feRow) return parseValue(defaultVal, type);
    if (feRow.enabled === 0) return parseValue(defaultVal, type);

    const rules: TargetingRule[] = (() => {
      try {
        return JSON.parse(feRow.rules || "[]");
      } catch {
        return [];
      }
    })();

    for (const rule of rules) {
      if (matchRule(rule, context)) {
        return parseValue(rule.value, type);
      }
    }

    const rolloutPct = Math.min(100, Math.max(0, feRow.rollout_percentage ?? 100));
    const userId = context?.id ?? "anonymous";
    const bucket = hashToBucket(flagKey, userId);
    if (bucket < rolloutPct) {
      const serveVal = feRow.value != null ? feRow.value : defaultVal;
      return parseValue(serveVal, type);
    }

    return parseValue(defaultVal, type);
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
