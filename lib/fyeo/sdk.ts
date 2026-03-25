import { evaluateFlag, evaluateAllFlags } from "./evaluator";
import type { UserContext } from "./types";
import type { FyeoConfig } from "./types";

let defaultConfig: FyeoConfig | null = null;

export function createFyeo(config: FyeoConfig) {
  defaultConfig = config;
  const env = config.environment;
  const dbPath = config.dbPath;
  const getContext = (request?: Request) =>
    config.defaultContext?.(request) ?? {};

  return {
    getFlag<T = boolean>(key: string, context?: UserContext): T {
      const ctx = context ?? getContext(undefined);
      const value = evaluateFlag(key, env, ctx, dbPath);
      return value as T;
    },
    getAllFlags(context?: UserContext): Record<string, unknown> {
      const ctx = context ?? getContext(undefined);
      return evaluateAllFlags(env, ctx, dbPath) as Record<string, unknown>;
    },
    getFlagInMiddleware(key: string, req: Request): Promise<boolean> {
      return getFlagInMiddleware(key, req);
    },
  };
}

function getConfig(): FyeoConfig {
  return (
    defaultConfig ?? {
      environment: process.env.FYEO_ENV ?? "development",
      dbPath: ".fyeo/flags.db",
    }
  );
}

export function getFlag<T = boolean>(key: string, context?: UserContext): T {
  const config = getConfig();
  const env = config.environment;
  const dbPath = config.dbPath;
  const ctx = context ?? config.defaultContext?.(undefined) ?? {};
  const value = evaluateFlag(key, env, ctx, dbPath);
  return value as T;
}

export function getAllFlags(context?: UserContext): Record<string, unknown> {
  const config = getConfig();
  const env = config.environment;
  const dbPath = config.dbPath;
  const ctx = context ?? config.defaultContext?.(undefined) ?? {};
  return evaluateAllFlags(env, ctx, dbPath) as Record<string, unknown>;
}

export async function getFlagInMiddleware(
  key: string,
  request: Request
): Promise<boolean> {
  try {
    const base = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    const url = `${proto}://${base}/api/fyeo/evaluate`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keys: [key],
        context: {
          id: request.headers.get("x-user-id") ?? "anonymous",
        },
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as Record<string, unknown>;
    const val = data[key];
    return val === true || val === "true";
  } catch {
    return false;
  }
}

export async function toggleFlag(
  flagKey: string,
  environmentSlug: string,
  enabled: boolean
): Promise<void> {
  const secret = process.env.FYEO_SECRET ?? getConfig().secret;
  const base =
    typeof window !== "undefined"
      ? ""
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
  const res = await fetch(`${base}/api/fyeo/flags/${encodeURIComponent(flagKey)}/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-fyeo-secret": secret ?? "",
    },
    body: JSON.stringify({ environment: environmentSlug, enabled }),
  });
  if (!res.ok) throw new Error(await res.text());
}
