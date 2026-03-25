"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "../../components/ToggleSwitch";
import { RolloutSlider } from "../../components/RolloutSlider";
import { AuditTimeline } from "../../components/AuditTimeline";
import { Toast } from "../../components/Toast";
import { Modal } from "../../components/Modal";
import { RowActionsMenu } from "../../components/RowActionsMenu";
import { saveFlagEnvAction, deleteFlagAction } from "@/lib/fyeo/server-actions";
import { flagAudienceSummary } from "@/lib/fyeo/flagAudienceSummary";
import type { AuditLogEntry } from "@/lib/fyeo/types";

type EnvConfig = {
  id: string;
  name: string;
  slug: string;
  color: string;
  enabled: number;
  value: string | null;
  rollout_percentage: number;
};

type FlagWithEnvs = {
  id: string;
  key: string;
  name: string;
  description: string;
  default_value: string;
  environments: EnvConfig[];
};

type EnvPersisted = Pick<EnvConfig, "enabled" | "value" | "rollout_percentage">;

function persistedFromEnvironments(envs: EnvConfig[]): Record<string, EnvPersisted> {
  const m: Record<string, EnvPersisted> = {};
  envs.forEach((e) => {
    m[e.slug] = {
      enabled: e.enabled,
      value: e.value,
      rollout_percentage: e.rollout_percentage,
    };
  });
  return m;
}

function sentenceAfterIfSaved(base: string): string {
  if (!base) return base;
  return base.charAt(0).toLowerCase() + base.slice(1);
}

export function FlagDetailClient({
  flag,
  auditEntries,
}: {
  flag: FlagWithEnvs;
  auditEntries: AuditLogEntry[];
}) {
  const [activeEnvSlug, setActiveEnvSlug] = useState(flag.environments[0]?.slug ?? "");
  const activeEnvSlugRef = useRef(activeEnvSlug);
  const [envConfig, setEnvConfig] = useState<Record<string, EnvConfig>>(() => {
    const m: Record<string, EnvConfig> = {};
    flag.environments.forEach((e) => {
      m[e.slug] = e;
    });
    return m;
  });
  const [savedBySlug, setSavedBySlug] = useState<Record<string, EnvPersisted>>(() =>
    persistedFromEnvironments(flag.environments)
  );
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // When navigating away and back, Next.js can restore previous client state.
    // This ensures we always reflect the latest server environments when the flag prop changes.
    const nextEnvConfig: Record<string, EnvConfig> = {};
    flag.environments.forEach((e) => {
      nextEnvConfig[e.slug] = e;
    });
    setEnvConfig(nextEnvConfig);
    setSavedBySlug(persistedFromEnvironments(flag.environments));
    const currentSlug = activeEnvSlugRef.current;
    if (!nextEnvConfig[currentSlug]) {
      setActiveEnvSlug(flag.environments[0]?.slug ?? "");
    }
  }, [flag.environments]);

  // Keep a ref in sync so environment-sync doesn't depend on activeEnvSlug
  // (tab switching should not reset client draft state).
  useEffect(() => {
    activeEnvSlugRef.current = activeEnvSlug;
  }, [activeEnvSlug]);

  const activeEnv = envConfig[activeEnvSlug];

  const envHasUnsavedChanges = useMemo(() => {
    if (!activeEnv) return false;
    const saved = savedBySlug[activeEnvSlug];
    if (!saved) return false;
    return (
      saved.enabled !== activeEnv.enabled ||
      saved.value !== activeEnv.value ||
      saved.rollout_percentage !== activeEnv.rollout_percentage
    );
  }, [activeEnv, activeEnvSlug, savedBySlug]);

  const audienceSummaryText = useMemo(() => {
    if (!activeEnv) return null;
    const defaultOn = flag.default_value === "true" || flag.default_value === "1";
    const base = flagAudienceSummary({
      environmentName: activeEnv.name,
      enabled: activeEnv.enabled === 1,
      rolloutPercentage: activeEnv.rollout_percentage,
      defaultOn,
      tense: envHasUnsavedChanges ? "future" : "present",
    });
    if (!envHasUnsavedChanges) return base;
    return `If you save your changes, ${sentenceAfterIfSaved(base)}`;
  }, [activeEnv, flag.default_value, envHasUnsavedChanges]);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
  };

  const handleToggle = (enabled: boolean) => {
    // Enabled toggle should behave like other draft settings:
    // update UI immediately, but only persist on "Save changes".
    setEnvConfig((prev) => ({
      ...prev,
      [activeEnvSlug]: { ...prev[activeEnvSlug], enabled: enabled ? 1 : 0 },
    }));
  };

  const handleSaveEnv = async () => {
    if (!activeEnv) return;
    setSaving(true);
    try {
      const result = await saveFlagEnvAction(flag.key, activeEnvSlug, {
        enabled: activeEnv.enabled,
        value: activeEnv.value,
        rollout_percentage: activeEnv.rollout_percentage,
      });
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      setSavedBySlug((prev) => ({
        ...prev,
        [activeEnvSlug]: {
          enabled: activeEnv.enabled,
          value: activeEnv.value,
          rollout_percentage: activeEnv.rollout_percentage,
        },
      }));
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
      router.push("/flags");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/flags" className="hover:text-gray-900 dark:hover:text-gray-200">Flags</Link>
          <span className="mx-2">/</span>
          <code className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300">
            {flag.key}
          </code>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{flag.name}</h1>
          </div>
          <div className="shrink-0 pt-1">
            <RowActionsMenu
              ariaLabel="Flag actions"
              items={[
                {
                  id: "delete",
                  label: "Delete flag",
                  destructive: true,
                  onSelect: () => setDeleteConfirmOpen(true),
                },
              ]}
            />
          </div>
        </div>
        {flag.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {flag.description}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            {flag.environments.map((env) => (
              <button
                key={env.id}
                type="button"
                onClick={() => setActiveEnvSlug(env.slug)}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeEnvSlug === env.slug
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: env.color }}
                  aria-hidden
                />
                <span className="font-mono text-sm leading-normal">{env.slug}</span>
              </button>
            ))}
          </div>
          {activeEnv && audienceSummaryText ? (
            <div className="border-b border-gray-100 bg-gray-50/90 px-5 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                {audienceSummaryText}
              </p>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-col">
            <div className="px-5 pb-6 pt-0">
              {activeEnv && (
                <>
                  <section className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1 pr-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enabled</h3>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          When off, this flag uses its default value for everyone in this environment. When on,
                          rollout decides what share of users see the enabled value.
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <ToggleSwitch
                          checked={activeEnv.enabled === 1}
                          onChange={handleToggle}
                          label="Enabled for this environment"
                        />
                      </div>
                    </div>
                  </section>
                  <div
                    className="my-4 h-px bg-gray-100 dark:bg-white/[0.06]"
                    aria-hidden
                  />
                  <section className="space-y-3">
                    <RolloutSlider
                      value={activeEnv.rollout_percentage}
                      onChange={(v) => updateLocalEnv({ rollout_percentage: v })}
                      description="When the flag is enabled, this is the percentage of users who receive the enabled value. The same user always gets the same result for this flag."
                    />
                  </section>
                </>
              )}
            </div>
            {activeEnv ? (
              <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <button
                  type="button"
                  onClick={handleSaveEnv}
                  disabled={saving || !envHasUnsavedChanges}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Audit log</h3>
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
