import { NextRequest, NextResponse } from "next/server";
import {
  listFlags,
  getFlagByKey,
  createFlag,
  updateFlag,
  deleteFlag,
  listEnvironments,
  getEnvironmentBySlug,
  createEnvironment,
  getFlagEnvironments,
  getFlagEnvironmentByFlagKeyAndSlug,
  updateFlagEnvironment,
  addAuditLog,
  getAuditLog,
} from "@/lib/gatehouse/db";
import { evaluateFlag, evaluateAllFlags } from "@/lib/gatehouse/evaluator";
import type { UserContext } from "@/lib/gatehouse/types";

const DB_PATH = process.env.GATEHOUSE_DB_PATH ?? ".gatehouse/flags.db";
const SECRET = process.env.GATEHOUSE_SECRET;

function auth(request: NextRequest): boolean {
  if (!SECRET) return true;
  const header = request.headers.get("x-gatehouse-secret");
  return header === SECRET;
}

function parsePath(pathSegments: string[]): { route: string[]; key?: string; envSlug?: string } {
  const route = pathSegments ?? [];
  let key: string | undefined;
  let envSlug: string | undefined;
  if (route[0] === "flags" && route[1]) {
    key = decodeURIComponent(route[1]);
    if (route[2] === "environments" && route[3]) envSlug = decodeURIComponent(route[3]);
    if (route[2] === "toggle") envSlug = undefined;
  }
  return { route: route, key, envSlug };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const { route, key } = parsePath(pathSegments);

  if (route[0] === "flags" && route.length === 1) {
    const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
    const expand = request.nextUrl.searchParams.get("expand");
    const flags = listFlags(tag, DB_PATH);
    if (expand === "environments") {
      const envs = listEnvironments(DB_PATH);
      const withEnvs = flags.map((flag) => {
        const feList = getFlagEnvironments(flag.id, DB_PATH);
        const environments = envs.map((env) => {
          const fe = feList.find((f) => f.environment_id === env.id);
          return {
            ...env,
            enabled: fe?.enabled ?? 0,
            value: fe?.value ?? null,
            rollout_percentage: fe?.rollout_percentage ?? 100,
            rules: fe?.rules ?? "[]",
          };
        });
        return { ...flag, environments };
      });
      return NextResponse.json(withEnvs);
    }
    return NextResponse.json(flags);
  }

  if (route[0] === "flags" && key && route.length === 2) {
    const flag = getFlagByKey(key, DB_PATH);
    if (!flag) return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    const envs = listEnvironments(DB_PATH);
    const feList = getFlagEnvironments(flag.id, DB_PATH);
    const envConfigs = envs.map((env) => {
      const fe = feList.find((f) => f.environment_id === env.id);
      return {
        ...env,
        enabled: fe?.enabled ?? 0,
        value: fe?.value ?? null,
        rollout_percentage: fe?.rollout_percentage ?? 100,
        rules: fe?.rules ?? "[]",
      };
    });
    return NextResponse.json({ ...flag, environments: envConfigs });
  }

  if (route[0] === "environments" && route.length === 1) {
    const envs = listEnvironments(DB_PATH);
    return NextResponse.json(envs);
  }

  if (route[0] === "audit" && route.length === 1) {
    const flag = request.nextUrl.searchParams.get("flag") ?? undefined;
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const entries = getAuditLog({ flag, limit }, DB_PATH);
    return NextResponse.json(entries);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const { route, key } = parsePath(pathSegments);

  if (route[0] === "flags" && route.length === 1) {
    const body = await request.json();
    const { key: flagKey, name, description, type, default_value } = body;
    if (!flagKey || !name) {
      return NextResponse.json({ error: "key and name required" }, { status: 400 });
    }
    const existing = getFlagByKey(flagKey, DB_PATH);
    if (existing) {
      return NextResponse.json({ error: "Flag key already exists" }, { status: 409 });
    }
    const flag = createFlag(
      flagKey,
      name,
      { description, type, default_value },
      DB_PATH
    );
    addAuditLog(flagKey, "created", { changes: JSON.stringify({ key: flagKey, name }) }, DB_PATH);
    return NextResponse.json(flag);
  }

  if (route[0] === "flags" && key && route[2] === "toggle") {
    const body = await request.json();
    const { environment: envSlug, enabled } = body;
    if (!envSlug) {
      return NextResponse.json({ error: "environment required" }, { status: 400 });
    }
    const env = getEnvironmentBySlug(envSlug, DB_PATH);
    if (!env) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }
    const fe = getFlagEnvironmentByFlagKeyAndSlug(key, envSlug, DB_PATH);
    if (!fe) {
      return NextResponse.json({ error: "Flag or environment not found" }, { status: 404 });
    }
    updateFlagEnvironment(key, envSlug, { enabled: enabled ? 1 : 0 }, DB_PATH);
    addAuditLog(key, "toggled", {
      environment: envSlug,
      changes: JSON.stringify({ enabled: !!enabled }),
    }, DB_PATH);
    return NextResponse.json({ ok: true });
  }

  if (route[0] === "environments" && route.length === 1) {
    const body = await request.json();
    const { name, slug, color } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: "name and slug required" }, { status: 400 });
    }
    const env = createEnvironment(name, slug, color ?? "#6366f1", DB_PATH);
    return NextResponse.json(env);
  }

  if (route[0] === "evaluate" && route.length === 1) {
    const body = await request.json();
    const { keys, context } = body as { keys?: string[]; context?: UserContext };
    const env = process.env.GATEHOUSE_ENV ?? "development";
    const ctx = context ?? {};
    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json({ error: "keys array required" }, { status: 400 });
    }
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      result[k] = evaluateFlag(k, env, ctx, DB_PATH);
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const { route, key } = parsePath(pathSegments);

  if (route[0] === "flags" && key && route.length === 2) {
    const flag = getFlagByKey(key, DB_PATH);
    if (!flag) return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    const body = await request.json();
    const updates: { name?: string; description?: string; type?: string; default_value?: string } = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.type !== undefined) updates.type = body.type;
    if (body.default_value !== undefined) updates.default_value = String(body.default_value);
    const updated = updateFlag(key, updates, DB_PATH);
    addAuditLog(key, "updated", { changes: JSON.stringify(updates) }, DB_PATH);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const { route, key, envSlug } = parsePath(pathSegments);

  if (route[0] === "flags" && key && route[2] === "environments" && envSlug && route.length === 4) {
    const fe = getFlagEnvironmentByFlagKeyAndSlug(key, envSlug, DB_PATH);
    if (!fe) {
      return NextResponse.json({ error: "Flag or environment not found" }, { status: 404 });
    }
    const body = await request.json();
    const updates: { enabled?: number; value?: string | null; rollout_percentage?: number; rules?: string } = {};
    if (body.enabled !== undefined) updates.enabled = body.enabled ? 1 : 0;
    if (body.value !== undefined) updates.value = body.value === null ? null : String(body.value);
    if (body.rollout_percentage !== undefined) updates.rollout_percentage = Math.min(100, Math.max(0, Number(body.rollout_percentage)));
    if (body.rules !== undefined) updates.rules = typeof body.rules === "string" ? body.rules : JSON.stringify(body.rules ?? []);
    const updated = updateFlagEnvironment(key, envSlug, updates, DB_PATH);
    addAuditLog(key, "updated", { environment: envSlug, changes: JSON.stringify(updates) }, DB_PATH);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const { route, key } = parsePath(pathSegments);

  if (route[0] === "flags" && key && route.length === 2) {
    const flag = getFlagByKey(key, DB_PATH);
    if (!flag) return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    deleteFlag(key, DB_PATH);
    addAuditLog(key, "deleted", { changes: JSON.stringify({ key }) }, DB_PATH);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
