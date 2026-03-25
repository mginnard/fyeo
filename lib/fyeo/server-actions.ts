"use server";

import {
  createFlag,
  updateFlag,
  deleteFlag,
  addAuditLog,
  getFlagByKey,
  getEnvironmentBySlug,
  getEnvironmentById,
  updateFlagEnvironment,
  listEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "@/lib/fyeo/db";

export type SaveFlagEnvInput = {
  enabled?: number;
  value?: string | null;
  rollout_percentage?: number;
};

const DB_PATH = process.env.FYEO_DB_PATH ?? ".fyeo/flags.db";

export async function createFlagAction(key: string, name: string, options?: { description?: string }) {
  const existing = getFlagByKey(key, DB_PATH);
  if (existing) return { error: "Flag key already exists" };
  const description = options?.description ?? "";
  const flag = createFlag(key, name, { description }, DB_PATH);
  addAuditLog(
    key,
    "created",
    { changes: JSON.stringify({ key, name, description }) },
    DB_PATH
  );
  return { flag };
}

export async function updateFlagAction(flagKey: string, updates: { name?: string; description?: string }) {
  const flag = getFlagByKey(flagKey, DB_PATH);
  if (!flag) return { error: "Flag not found" };
  const updated = updateFlag(flagKey, updates, DB_PATH);
  if (!updated) return { error: "Update failed" };
  addAuditLog(flagKey, "updated", { changes: JSON.stringify(updates) }, DB_PATH);
  return { flag: updated };
}

export async function toggleFlagAction(flagKey: string, environmentSlug: string, enabled: boolean) {
  const flag = getFlagByKey(flagKey, DB_PATH);
  if (!flag) return { error: "Flag not found" };
  const env = getEnvironmentBySlug(environmentSlug, DB_PATH);
  if (!env) return { error: "Environment not found" };
  updateFlagEnvironment(flagKey, environmentSlug, { enabled: enabled ? 1 : 0, rules: "[]" }, DB_PATH);
  addAuditLog(flagKey, "toggled", {
    environment: environmentSlug,
    changes: JSON.stringify({ enabled }),
  }, DB_PATH);
  return { ok: true };
}

export async function deleteFlagAction(flagKey: string) {
  const flag = getFlagByKey(flagKey, DB_PATH);
  if (!flag) return { error: "Flag not found" };
  addAuditLog(flagKey, "deleted", { changes: JSON.stringify({ key: flagKey, name: flag.name }) }, DB_PATH);
  const deleted = deleteFlag(flagKey, DB_PATH);
  if (!deleted) return { error: "Delete failed" };
  return { ok: true };
}

export async function createEnvironmentAction(name: string, slug: string, color: string) {
  const existing = listEnvironments(DB_PATH).find((e) => e.slug === slug);
  if (existing) return { error: "Slug already exists" };
  const env = createEnvironment(name, slug, color, DB_PATH);
  return { env };
}

export async function updateEnvironmentColorAction(environmentId: string, color: string) {
  const env = getEnvironmentById(environmentId, DB_PATH);
  if (!env) return { error: "Environment not found" };
  const updated = updateEnvironment(environmentId, { color }, DB_PATH);
  if (!updated) return { error: "Update failed" };
  return { env: updated };
}

export async function deleteEnvironmentAction(environmentId: string) {
  const env = getEnvironmentById(environmentId, DB_PATH);
  if (!env) return { error: "Environment not found" };
  const ok = deleteEnvironment(environmentId, DB_PATH);
  if (!ok) return { error: "Delete failed" };
  return { ok: true };
}

export async function saveFlagEnvAction(
  flagKey: string,
  environmentSlug: string,
  updates: SaveFlagEnvInput
) {
  const flag = getFlagByKey(flagKey, DB_PATH);
  if (!flag) return { error: "Flag not found" };
  const env = getEnvironmentBySlug(environmentSlug, DB_PATH);
  if (!env) return { error: "Environment not found" };
  updateFlagEnvironment(flagKey, environmentSlug, { ...updates, rules: "[]" }, DB_PATH);
  addAuditLog(flagKey, "updated", {
    environment: environmentSlug,
    changes: JSON.stringify({ ...updates, rules: "[]" }),
  }, DB_PATH);
  return { ok: true };
}
