"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

type SortableThProps = {
  label: string;
  columnKey: string;
  activeKey: string | null;
  direction: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
};

export function SortableTh({
  label,
  columnKey,
  activeKey,
  direction,
  onSort,
  className = "",
}: SortableThProps) {
  const active = activeKey === columnKey;
  const ariaSort = active ? (direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className="inline-flex items-center gap-1.5 rounded-md -mx-1 -my-0.5 px-1 py-0.5 text-left hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white"
      >
        <span>{label}</span>
        <span
          className="text-gray-400 dark:text-gray-500 w-4 h-4 min-w-4 min-h-4 shrink-0 inline-flex items-center justify-center"
          aria-hidden
        >
          {active ? (
            direction === "asc" ? (
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ArrowDown className="h-4 w-4" strokeWidth={2} />
            )
          ) : null}
        </span>
      </button>
    </th>
  );
}
