"use client";

import { useState, useMemo, useCallback } from "react";
import { Modal } from "../components/Modal";
import { Toast } from "../components/Toast";
import { SortableTh } from "../components/SortableTh";
import { RowActionsMenu } from "../components/RowActionsMenu";
import { ENVIRONMENT_TAILWIND_HEX } from "../components/tailwindColorPalette";
import {
  createEnvironmentAction,
  updateEnvironmentColorAction,
  deleteEnvironmentAction,
} from "@/lib/fyeo/server-actions";

type EnvRow = {
  id: string;
  name: string;
  slug: string;
  color: string;
  enabledCount: number;
};

type EnvSortKey = "name" | "slug" | "color" | "enabledCount";

function compareEnvs(a: EnvRow, b: EnvRow, key: EnvSortKey, dir: 1 | -1): number {
  switch (key) {
    case "name":
      return dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "slug":
      return dir * a.slug.localeCompare(b.slug, undefined, { sensitivity: "base" });
    case "color":
      return dir * a.color.toLowerCase().localeCompare(b.color.toLowerCase());
    case "enabledCount":
      if (a.enabledCount !== b.enabledCount) return dir * (a.enabledCount - b.enabledCount);
      return dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    default:
      return 0;
  }
}

export function EnvironmentsClient({
  initialEnvironments,
}: {
  initialEnvironments: EnvRow[];
}) {
  const [environments, setEnvironments] = useState(initialEnvironments);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [sortKey, setSortKey] = useState<EnvSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = useCallback(
    (key: string) => {
      const k = key as EnvSortKey;
      if (sortKey === k) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(k);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const sortedEnvironments = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...environments].sort((a, b) => compareEnvs(a, b, sortKey, dir));
  }, [environments, sortKey, sortDir]);

  const [editColorEnv, setEditColorEnv] = useState<EnvRow | null>(null);
  const [paletteColor, setPaletteColor] = useState<string>(ENVIRONMENT_TAILWIND_HEX[0]);
  const [savingColor, setSavingColor] = useState(false);
  const [deleteEnv, setDeleteEnv] = useState<EnvRow | null>(null);
  const [deletingEnv, setDeletingEnv] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
  };

  const refetchEnvironments = useCallback(async () => {
    const res = await fetch("/api/fyeo/environments");
    const list = await res.json();
    const flagsRes = await fetch("/api/fyeo/flags");
    const flags = await flagsRes.json();
    const counts: Record<string, number> = {};
    for (const flag of flags) {
      const detail = await fetch(`/api/fyeo/flags/${encodeURIComponent(flag.key)}`).then((r) => r.json());
      (detail.environments ?? []).forEach((env: { id: string; enabled: number }) => {
        if (env.enabled) counts[env.id] = (counts[env.id] ?? 0) + 1;
      });
    }
    setEnvironments(list.map((e: EnvRow) => ({ ...e, enabledCount: counts[e.id] ?? 0 })));
  }, []);

  const handleSaveColor = async () => {
    if (!editColorEnv) return;
    setSavingColor(true);
    try {
      const result = await updateEnvironmentColorAction(editColorEnv.id, paletteColor);
      if ("error" in result) {
        showToast(result.error ?? "Could not update color");
        return;
      }
      setEditColorEnv(null);
      showToast("Color updated");
      await refetchEnvironments();
    } finally {
      setSavingColor(false);
    }
  };

  const handleConfirmDeleteEnv = async () => {
    if (!deleteEnv) return;
    setDeletingEnv(true);
    try {
      const result = await deleteEnvironmentAction(deleteEnv.id);
      if ("error" in result) {
        showToast(result.error ?? "Could not delete environment");
        return;
      }
      setDeleteEnv(null);
      showToast("Environment deleted");
      await refetchEnvironments();
    } finally {
      setDeletingEnv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      const result = await createEnvironmentAction(name.trim(), slug.trim().toLowerCase(), color);
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      setModalOpen(false);
      setName("");
      setSlug("");
      setColor("#6366f1");
      showToast("Environment created");
      await refetchEnvironments();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Environments</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
          Manage environments for your flags.
        </p>
      </div>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Add environment
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <SortableTh
                label="Name"
                columnKey="name"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTh
                label="Slug"
                columnKey="slug"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTh
                label="Color"
                columnKey="color"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTh
                label="Flags enabled"
                columnKey="enabledCount"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 w-14">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEnvironments.map((env) => (
              <tr key={env.id} className="border-b border-gray-100 dark:border-white/5 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{env.name}</td>
                <td className="px-4 py-3">
                  <code className="inline-flex w-max px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                    {env.slug}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-white/20"
                    style={{ backgroundColor: env.color }}
                  />
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{env.enabledCount}</td>
                <td className="px-4 py-3 text-right align-middle">
                  <RowActionsMenu
                    ariaLabel={`Actions for environment ${env.name}`}
                    items={[
                      {
                        id: "edit",
                        label: "Edit",
                        onSelect: () => {
                          setPaletteColor(env.color);
                          setEditColorEnv(env);
                        },
                      },
                      {
                        id: "delete",
                        label: "Delete",
                        destructive: true,
                        onSelect: () => setDeleteEnv(env),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={editColorEnv !== null} onClose={() => !savingColor && setEditColorEnv(null)} title="Environment color">
        {editColorEnv ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Choose a color for <span className="font-medium text-gray-900 dark:text-white">{editColorEnv.name}</span>.
            </p>
            <div
              className="grid grid-cols-8 gap-2"
              role="listbox"
              aria-label="Tailwind palette colors"
            >
              {ENVIRONMENT_TAILWIND_HEX.map((hex) => {
                const selected = paletteColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-gray-900 ${
                      selected ? "border-gray-900 dark:border-white ring-2 ring-gray-900/20 dark:ring-white/30" : "border-gray-200 dark:border-white/20"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                    onClick={() => setPaletteColor(hex)}
                  />
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={savingColor}
                onClick={() => setEditColorEnv(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingColor}
                onClick={() => void handleSaveColor()}
                className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50"
              >
                {savingColor ? "Saving…" : "Save color"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        open={deleteEnv !== null}
        onClose={() => !deletingEnv && setDeleteEnv(null)}
        title="Delete environment"
      >
        {deleteEnv ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Delete <span className="font-medium text-gray-900 dark:text-white">{deleteEnv.name}</span> (
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-white/10">{deleteEnv.slug}</code>
              )? All flag overrides for this environment will be removed. Other parts of your stack that still reference this
              slug may misbehave. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deletingEnv}
                onClick={() => setDeleteEnv(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingEnv}
                onClick={() => void handleConfirmDeleteEnv()}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingEnv ? "Deleting…" : "Delete environment"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add environment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm focus:border-gray-900 dark:focus:border-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. production"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm font-mono focus:border-gray-900 dark:focus:border-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 dark:border-white/10 cursor-pointer bg-gray-100 dark:bg-white/5"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50">
              Create
            </button>
          </div>
        </form>
      </Modal>
      <Toast message={toast} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}
