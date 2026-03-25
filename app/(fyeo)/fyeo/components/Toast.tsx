"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Toast({
  message,
  visible,
  onDismiss,
}: {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg text-sm text-gray-900 dark:text-gray-100"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
