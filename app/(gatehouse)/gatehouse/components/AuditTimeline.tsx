"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditLogEntry } from "@/lib/gatehouse/types";

const COLUMNS = [
  { key: "time", label: "Time", width: "11rem" },
  { key: "environment", label: "Environment", width: "10rem" },
  { key: "action", label: "Action", width: "8rem" },
  { key: "actor", label: "Actor", width: "10rem" },
  { key: "changes", label: "Changes", width: undefined },
] as const;

const MAX_CHANGES_PREVIEW = 60;

function truncateChanges(changes: string): string {
  if (!changes || changes === "{}") return "—";
  try {
    const s = JSON.stringify(JSON.parse(changes), null, 0);
    if (s.length <= MAX_CHANGES_PREVIEW) return s;
    return s.slice(0, MAX_CHANGES_PREVIEW) + "…";
  } catch {
    return changes.length <= MAX_CHANGES_PREVIEW ? changes : changes.slice(0, MAX_CHANGES_PREVIEW) + "…";
  }
}

function formatChangesFull(changes: string): string {
  if (!changes || changes === "{}") return "—";
  try {
    return JSON.stringify(JSON.parse(changes), null, 2);
  } catch {
    return changes;
  }
}

export function AuditTimeline({ entries }: { entries: AuditLogEntry[] }) {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No audit entries yet.</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
            <colgroup>
              {COLUMNS.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`border-b border-gray-100 dark:border-white/5 cursor-pointer transition-colors ${
                    selectedEntry?.id === entry.id
                      ? "bg-gray-100 dark:bg-white/10"
                      : "hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate">
                    {entry.environment ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 truncate">
                    {entry.actor}
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <span
                      className="font-mono text-gray-500 dark:text-gray-400 truncate block"
                      title={entry.changes && entry.changes !== "{}" ? entry.changes : undefined}
                    >
                      {truncateChanges(entry.changes)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              role="button"
              tabIndex={0}
              aria-label="Close panel"
              onClick={() => setSelectedEntry(null)}
              onKeyDown={(e) => e.key === "Escape" && setSelectedEntry(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-white/10 shadow-xl flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit entry</h2>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Time</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Flag</dt>
                  <dd>
                    <Link
                      href={`/gatehouse/flags/${encodeURIComponent(selectedEntry.flag_key)}`}
                      className="font-mono text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {selectedEntry.flag_key}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Environment</dt>
                  <dd className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.environment ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Action</dt>
                  <dd>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                      {selectedEntry.action}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Actor</dt>
                  <dd className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.actor}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Changes</dt>
                  <dd>
                    <pre className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all overflow-x-auto">
                      {formatChangesFull(selectedEntry.changes)}
                    </pre>
                  </dd>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
