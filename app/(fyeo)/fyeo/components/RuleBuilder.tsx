"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TargetingRule, TargetingRuleOperator } from "@/lib/fyeo/types";

const OPERATORS: { value: TargetingRuleOperator; label: string }[] = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "in", label: "in list" },
  { value: "nin", label: "not in list" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "regex", label: "matches regex" },
  { value: "semver_eq", label: "semver equals" },
  { value: "semver_gt", label: "semver >" },
  { value: "semver_lt", label: "semver <" },
];

const COMMON_ATTRIBUTES = ["id", "email", "name", "country", "plan"];

export function RuleBuilder({
  rules,
  onChange,
  serveValueLabel = "Serve value",
  flagType = "boolean",
  disabled,
}: {
  rules: TargetingRule[];
  onChange: (rules: TargetingRule[]) => void;
  serveValueLabel?: string;
  flagType?: string;
  disabled?: boolean;
}) {
  const addRule = () => {
    onChange([
      ...rules,
      { attribute: "id", operator: "eq", values: [""], value: flagType === "boolean" ? "true" : "" },
    ]);
  };

  const updateRule = (index: number, patch: Partial<TargetingRule>) => {
    const next = [...rules];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Targeting rules</span>
        {!disabled && (
          <button
            type="button"
            onClick={addRule}
            className="text-xs text-gray-900 dark:text-white hover:underline"
          >
            + Add rule
          </button>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {rules.map((rule, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2"
          >
            <div className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-2 items-center">
              <input
                type="text"
                value={rule.attribute}
                onChange={(e) => updateRule(index, { attribute: e.target.value })}
                disabled={disabled}
                list="rule-attributes"
                placeholder="Attribute"
                className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-sm font-mono focus:border-gray-900 dark:focus:border-white outline-none disabled:opacity-50"
              />
              <datalist id="rule-attributes">
                {COMMON_ATTRIBUTES.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <select
                value={rule.operator}
                onChange={(e) => updateRule(index, { operator: e.target.value as TargetingRuleOperator })}
                disabled={disabled}
                className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-sm focus:border-gray-900 dark:focus:border-white outline-none disabled:opacity-50"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={Array.isArray(rule.values) ? String(rule.values[0] ?? "") : rule.value}
                onChange={(e) => updateRule(index, { values: [e.target.value] })}
                disabled={disabled}
                placeholder="Value"
                className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-sm font-mono focus:border-gray-900 dark:focus:border-white outline-none disabled:opacity-50"
              />
              <input
                type="text"
                value={rule.value}
                onChange={(e) => updateRule(index, { value: e.target.value })}
                disabled={disabled}
                placeholder={serveValueLabel}
                title={serveValueLabel}
                className="px-2 py-1.5 rounded bg-gray-100 dark:bg-white/5 border border-success/50 text-sm font-mono focus:border-success outline-none disabled:opacity-50 w-20"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-white/5"
                  aria-label="Remove rule"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
