"use client";

import { motion } from "framer-motion";

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-gray-300 dark:border-white/20 p-0.5 leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white ${
        checked ? "justify-end bg-success" : "justify-start bg-gray-200 dark:bg-white/10"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={label}
    >
      <motion.span
        className="pointer-events-none h-5 w-5 shrink-0 rounded-full bg-white shadow ring-0"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        layout
      />
    </button>
  );
}
