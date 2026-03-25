"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4 text-gray-900 dark:text-gray-100">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
