"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { FlagTable } from "./components/FlagTable";
import { Modal } from "./components/Modal";
import { EmptyState } from "./components/EmptyState";
import { Toast } from "./components/Toast";
import { createFlagAction } from "@/lib/fyeo/server-actions";

type EnvConfig = { id: string; name: string; slug: string; color: string; enabled: number };
type FlagRow = {
  id: string;
  key: string;
  name: string;
  environments: EnvConfig[];
};

export function FlagListClient({
  initialFlags,
  environments,
}: {
  initialFlags: FlagRow[];
  environments: { id: string; name: string; slug: string; color: string }[];
}) {
  const [flags, setFlags] = useState(initialFlags);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [createKey, setCreateKey] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/fyeo/flags?expand=environments");
    if (!res.ok) return;
    const withEnvs = await res.json();
    setFlags(withEnvs);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createKey.trim() || !createName.trim()) return;
    setCreating(true);
    try {
      const result = await createFlagAction(createKey.trim(), createName.trim(), {
        description: createDescription.trim(),
      });
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      setCreateOpen(false);
      setCreateKey("");
      setCreateName("");
      setCreateDescription("");
      showToast("Flag created");
      refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };
  const filtered = flags.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.key.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Flags</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
          Manage feature flags and their environment overrides.
        </p>
      </div>
      <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 w-full max-w-md">
          <input
            type="text"
            role="searchbox"
            placeholder="Search by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search flags by name or key"
            className="w-full min-w-0 pl-3 pr-9 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 self-end px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors sm:self-auto"
        >
          Create Flag
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title={flags.length === 0 ? "No flags yet" : "No matching flags"}
          description={
            flags.length === 0
              ? "Create your first feature flag to get started."
              : "Try adjusting your search."
          }
          action={
            flags.length === 0 ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Create Flag
              </button>
            ) : null
          }
        />
      ) : (
        <FlagTable flags={filtered} onFlagDeleted={refresh} onDeleteError={showToast} />
      )}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create flag">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Key</label>
            <input
              type="text"
              value={createKey}
              onChange={(e) => setCreateKey(e.target.value)}
              placeholder="e.g. new-checkout-flow"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Human-readable name"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm focus:border-gray-900 dark:focus:border-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Description <span className="font-normal text-gray-400 dark:text-gray-500">(optional)</span>
            </label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Explain what this flag controls and how it should be used."
              className="w-full min-h-[70px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-sm focus:border-gray-900 dark:focus:border-white outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
      <Toast message={toast} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}
