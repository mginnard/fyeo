"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "../../components/ToggleSwitch";
import { RolloutSlider } from "../../components/RolloutSlider";
import { RuleBuilder } from "../../components/RuleBuilder";
import { AuditTimeline } from "../../components/AuditTimeline";
import { Toast } from "../../components/Toast";
import { Modal } from "../../components/Modal";
import { toggleFlagAction, saveFlagEnvAction, updateFlagAction, deleteFlagAction } from "@/lib/gatehouse/server-actions";
import type { TargetingRule } from "@/lib/gatehouse/types";
import type { AuditLogEntry } from "@/lib/gatehouse/types";

type EnvConfig = {
  id: string;
  name: string;
  slug: string;
  color: string;
  enabled: number;
  value: string | null;
  rollout_percentage: number;
  rules: string;
};

type FlagWithEnvs = {
  id: string;
  key: string;
  name: string;
  description: string;
  type: string;
  default_value: string;
  environments: EnvConfig[];
};

export function FlagDetailClient({
  flag,
  auditEntries,
}: {
  flag: FlagWithEnvs;
  auditEntries: AuditLogEntry[];
}) {
  const [activeEnvSlug, setActiveEnvSlug] = useState(flag.environments[0]?.slug ?? "");
  const [envConfig, setEnvConfig] = useState<Record<string, EnvConfig>>(() => {
    const m: Record<string, EnvConfig> = {};
    flag.environments.forEach((e) => {
      m[e.slug] = e;
    });
    return m;
  });
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editType, setEditType] = useState(flag.type);
  const [editDefaultValue, setEditDefaultValue] = useState(flag.default_value);
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Keep editable metadata in sync with latest flag data
    setEditType(flag.type);
    setEditDefaultValue(flag.default_value);
  }, [flag.type, flag.default_value]);

  useEffect(() => {
    // When navigating away and back, Next.js can restore previous client state.
    // This ensures we always reflect the latest server environments when the flag prop changes.
    const nextEnvConfig: Record<string, EnvConfig> = {};
    flag.environments.forEach((e) => {
      nextEnvConfig[e.slug] = e;
    });
    setEnvConfig(nextEnvConfig);
    if (!nextEnvConfig[activeEnvSlug]) {
      setActiveEnvSlug(flag.environments[0]?.slug ?? "");
    }
  }, [flag.environments, activeEnvSlug]);

  const activeEnv = envConfig[activeEnvSlug];
  const rules: TargetingRule[] = (() => {
    if (!activeEnv) return [];
    try {
      return JSON.parse(activeEnv.rules || "[]");
    } catch {
      return [];
    }
  })();

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
  };

  const handleToggle = async (enabled: boolean) => {
    const result = await toggleFlagAction(flag.key, activeEnvSlug, enabled);
    if ("error" in result) {
      showToast(result.error ?? "Error");
      return;
    }
    setEnvConfig((prev) => ({
      ...prev,
      [activeEnvSlug]: { ...prev[activeEnvSlug], enabled: enabled ? 1 : 0 },
    }));
    showToast("Updated");
  };

  const handleSaveEnv = async () => {
    if (!activeEnv) return;
    setSaving(true);
    try {
      const result = await saveFlagEnvAction(flag.key, activeEnvSlug, {
        enabled: activeEnv.enabled,
        value: activeEnv.value,
        rollout_percentage: activeEnv.rollout_percentage,
        rules: activeEnv.rules,
      });
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      showToast("Saved");
    } finally {
      setSaving(false);
    }
  };

  const updateLocalEnv = (patch: Partial<EnvConfig>) => {
    setEnvConfig((prev) => ({
      ...prev,
      [activeEnvSlug]: { ...prev[activeEnvSlug], ...patch },
    }));
  };

  const handleSaveFlagMeta = async () => {
    setSavingMeta(true);
    try {
      const result = await updateFlagAction(flag.key, { type: editType, default_value: editDefaultValue });
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      showToast("Flag settings saved");
      router.refresh();
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDeleteFlag = async () => {
    setDeleting(true);
    try {
      const result = await deleteFlagAction(flag.key);
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      setDeleteConfirmOpen(false);
      showToast("Flag deleted");
      router.push("/gatehouse");
    } finally {
      setDeleting(false);
    }
  };

  const valueInput = () => {
    const env = envConfig[activeEnvSlug];
    if (!env) return null;
    const raw = env.value ?? flag.default_value;
    if (flag.type === "boolean") {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={raw === "true" || raw === "1"}
            onChange={(e) => updateLocalEnv({ value: e.target.checked ? "true" : "false" })}
            className="rounded border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
          />
          <span className="text-sm">Override value</span>
        </label>
      );
    }
    if (flag.type === "number") {
      return (
        <input
          type="number"
          value={raw}
          onChange={(e) => updateLocalEnv({ value: e.target.value })}
          className="w-full max-w-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
        />
      );
    }
    if (flag.type === "json") {
      return (
        <textarea
          value={raw ?? "{}"}
          onChange={(e) => updateLocalEnv({ value: e.target.value })}
          className="w-full min-h-[80px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
          spellCheck={false}
        />
      );
    }
    return (
      <input
        type="text"
        value={raw ?? ""}
        onChange={(e) => updateLocalEnv({ value: e.target.value })}
        className="w-full max-w-md px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
      />
    );
  };

  return (
    <>
      <div className="mb-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/gatehouse" className="hover:text-gray-900 dark:hover:text-gray-200">Flags</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{flag.key}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{flag.name}</h1>
            <code className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300">
              {flag.key}
            </code>
          </div>
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/50 transition-colors"
          >
            Delete flag
          </button>
        </div>
        {flag.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {flag.description}
          </p>
        )}

        <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Type & default value</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm focus:border-gray-900 dark:focus:border-white outline-none"
              >
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Default value</label>
              {editType === "json" ? (
                <textarea
                  value={editDefaultValue}
                  onChange={(e) => setEditDefaultValue(e.target.value)}
                  className="w-full min-h-[60px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
                  spellCheck={false}
                />
              ) : (
                <input
                  type={editType === "number" ? "number" : "text"}
                  value={editDefaultValue}
                  onChange={(e) => setEditDefaultValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
                />
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveFlagMeta}
              disabled={savingMeta}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {savingMeta ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            {flag.environments.map((env) => (
              <button
                key={env.id}
                type="button"
                onClick={() => setActiveEnvSlug(env.slug)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeEnvSlug === env.slug
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: env.color }}
                />
                {env.slug}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-4">
            {activeEnv && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
                  <ToggleSwitch
                    checked={activeEnv.enabled === 1}
                    onChange={handleToggle}
                  />
                </div>
                {flag.type !== "boolean" && (
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Value in this environment (optional)</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Leave empty to use the flag&apos;s default. Set a value to serve something different in this environment.</p>
                    {valueInput()}
                  </div>
                )}
                <RolloutSlider
                  value={activeEnv.rollout_percentage}
                  onChange={(v) => updateLocalEnv({ rollout_percentage: v })}
                />
                <RuleBuilder
                  rules={rules}
                  onChange={(r) =>
                    updateLocalEnv({ rules: JSON.stringify(r) })
                  }
                  flagType={flag.type}
                />
                <button
                  type="button"
                  onClick={handleSaveEnv}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit log</h3>
          </div>
          <div>
            <AuditTimeline entries={auditEntries} />
          </div>
        </div>
      </div>
      <Modal open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} title="Delete flag">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{flag.key}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteFlag}
            disabled={deleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
      <Toast message={toast} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}
