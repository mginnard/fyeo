"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvironmentDot } from "./EnvironmentDot";
import { SortableTh } from "./SortableTh";
import { Modal } from "./Modal";
import { RowActionsMenu } from "./RowActionsMenu";
import { deleteFlagAction } from "@/lib/fyeo/server-actions";

type EnvConfig = { id: string; name: string; slug: string; color: string; enabled: number };
type FlagRow = {
  id: string;
  key: string;
  name: string;
  environments: EnvConfig[];
};

type FlagSortKey = "name" | "key" | "enabledIn";

function enabledEnvCount(flag: FlagRow): number {
  return flag.environments.filter((e) => e.enabled === 1).length;
}

function enabledEnvSlugsJoined(flag: FlagRow): string {
  return flag.environments
    .filter((e) => e.enabled === 1)
    .map((e) => e.slug)
    .sort()
    .join(",");
}

function compareFlags(a: FlagRow, b: FlagRow, key: FlagSortKey, dir: 1 | -1): number {
  switch (key) {
    case "name":
      return dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "key":
      return dir * a.key.localeCompare(b.key, undefined, { sensitivity: "base" });
    case "enabledIn": {
      const ca = enabledEnvCount(a);
      const cb = enabledEnvCount(b);
      if (ca !== cb) return dir * (ca - cb);
      return dir * enabledEnvSlugsJoined(a).localeCompare(enabledEnvSlugsJoined(b));
    }
    default:
      return 0;
  }
}

export function FlagTable({
  flags,
  onFlagDeleted,
  onDeleteError,
}: {
  flags: FlagRow[];
  onFlagDeleted?: () => void;
  onDeleteError?: (message: string) => void;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<FlagSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = useCallback(
    (key: string) => {
      const k = key as FlagSortKey;
      if (sortKey === k) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(k);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const sortedFlags = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...flags].sort((a, b) => compareFlags(a, b, sortKey, dir));
  }, [flags, sortKey, sortDir]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteFlagAction(deleteTarget.key);
      if ("error" in result) {
        onDeleteError?.(result.error ?? "Delete failed");
        return;
      }
      setDeleteTarget(null);
      onFlagDeleted?.();
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, onFlagDeleted, onDeleteError, router]);

  if (flags.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <SortableTh
                label="Flag"
                columnKey="name"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTh
                label="Slug"
                columnKey="key"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTh
                label="Enabled in"
                columnKey="enabledIn"
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
            {sortedFlags.map((flag) => (
              <tr
                key={flag.id}
                className="border-b border-gray-100 dark:border-white/5 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 align-middle min-w-[220px]">
                  <Link
                    href={`/flags/${encodeURIComponent(flag.key)}`}
                    className="font-medium text-gray-900 dark:text-white hover:underline"
                  >
                    {flag.name}
                  </Link>
                </td>
                <td className="px-4 py-3 align-middle">
                  <code className="inline-flex w-max px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                    {flag.key}
                  </code>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-wrap gap-3 items-center">
                    {flag.environments
                      .filter((env) => env.enabled === 1)
                      .map((env) => (
                        <div key={env.id} className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 bg-gray-50 dark:bg-white/5">
                          <EnvironmentDot color={env.color} enabled />
                          <span
                            className="text-gray-600 dark:text-gray-300 text-xs"
                            title={env.slug}
                          >
                            {env.slug}
                          </span>
                        </div>
                      ))}
                    {flag.environments.every((env) => env.enabled === 0) && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">--</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  <RowActionsMenu
                    ariaLabel={`Actions for flag ${flag.name}`}
                    items={[
                      {
                        id: "edit",
                        label: "Edit",
                        onSelect: () => router.push(`/flags/${encodeURIComponent(flag.key)}`),
                      },
                      {
                        id: "delete",
                        label: "Delete",
                        destructive: true,
                        onSelect: () => setDeleteTarget({ key: flag.key, name: flag.name }),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete flag"
      >
        {deleteTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Delete <span className="font-medium text-gray-900 dark:text-white">{deleteTarget.name}</span>{" "}
              (<code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-white/10">{deleteTarget.key}</code>
              )? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete flag"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
