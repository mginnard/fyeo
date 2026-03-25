"use client";

import { useState, useCallback } from "react";

export function JsonEditor({
  value,
  onChange,
  disabled,
  placeholder = "{}",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleBlur = useCallback(() => {
    if (raw === value) return;
    try {
      const parsed = JSON.parse(raw || "null");
      onChange(typeof parsed === "string" ? raw : JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [raw, value, onChange]);

  return (
    <div className="space-y-1">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y disabled:opacity-50"
        spellCheck={false}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
