"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { EnvironmentDot } from "./EnvironmentDot";
import { SortableTh } from "./SortableTh";

type EnvConfig = { id: string; name: string; slug: string; color: string; enabled: number };
type FlagRow = {
  id: string;
  key: string;
  name: string;
  type: string;
  environments: EnvConfig[];
};

type FlagSortKey = "name" | "key" | "type" | "enabledIn";

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
    case "type":
      return dir * a.type.localeCompare(b.type, undefined, { sensitivity: "base" });
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

export function FlagTable({ flags }: { flags: FlagRow[] }) {
  const [sortKey, setSortKey] = useState<FlagSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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
                label="Type"
                columnKey="type"
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
            </tr>
          </thead>
          <tbody>
            {sortedFlags.map((flag) => (
              <tr
                key={flag.id}
                className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 align-top min-w-[220px]">
                  <Link
                    href={`/fyeo/flags/${encodeURIComponent(flag.key)}`}
                    className="font-medium text-gray-900 dark:text-white hover:underline"
                  >
                    {flag.name}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top">
                  <code className="inline-flex w-max px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                    {flag.key}
                  </code>
                </td>
                <td className="px-4 py-3 align-top text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {flag.type}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-3">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
